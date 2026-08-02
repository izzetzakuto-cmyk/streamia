import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.streamia.co'

/**
 * Edge-level auth gate. Runs BEFORE the page renders.
 *
 * Reads the `sl_access` cookie (set on `.streamia.co` by the API). Because
 * `sl_access` has a short 15-min TTL while `sl_refresh` lives 7 days, a naive
 * "is sl_access present?" check bounced still-logged-in users to /login the
 * moment their access token lapsed — every navigation to a protected route
 * after 15 idle minutes looked like a random logout (e.g. "Upgrade logs me
 * out"). So when the access cookie is gone but the refresh cookie is still
 * here, we mint a fresh access token at the edge, hand it to this request's
 * SSR (via the forwarded Cookie header) and persist the rotated cookies in the
 * browser. Only a truly missing/expired refresh token redirects to /login.
 *
 * Server components still double-check via `getMeServer()`.
 */
export async function middleware(req) {
  const access = req.cookies.get('sl_access')?.value
  if (access) return NextResponse.next()

  const refresh = req.cookies.get('sl_refresh')?.value
  // Never rotate the refresh token for speculative prefetch requests: several
  // <Link> prefetches share one expired access cookie, and if each triggered a
  // refresh they'd reuse the same refresh token concurrently — which the API's
  // reuse-detection treats as theft and revokes the whole session (the exact
  // logout we're fixing). Let the real, user-initiated navigation do it.
  const isPrefetch =
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch' ||
    req.headers.get('x-purpose') === 'prefetch'

  if (refresh && !isPrefetch) {
    const refreshed = await tryEdgeRefresh(refresh)
    if (refreshed) {
      // Make the fresh access token visible to THIS request's SSR — api-server
      // builds its outbound Cookie header from `cookies()`, which reflects the
      // request headers we rewrite here.
      const headers = new Headers(req.headers)
      headers.set('cookie', mergeAccessCookie(req.headers.get('cookie') || '', refreshed.accessValue))
      const res = NextResponse.next({ request: { headers } })
      // Persist the rotated sl_access / sl_refresh in the browser.
      for (const c of refreshed.setCookies) res.headers.append('set-cookie', c)
      return res
    }
  }

  return redirectToLogin(req)
}

/** POST /api/auth/refresh at the edge using the refresh cookie. */
async function tryEdgeRefresh(refresh) {
  try {
    const r = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: `sl_refresh=${refresh}` },
      body: '{}',
    })
    if (!r.ok) return null
    const setCookies =
      typeof r.headers.getSetCookie === 'function'
        ? r.headers.getSetCookie()
        : [r.headers.get('set-cookie')].filter(Boolean)
    const accessValue = extractCookieValue(setCookies, 'sl_access')
    if (!accessValue) return null
    return { setCookies, accessValue }
  } catch {
    return null
  }
}

function extractCookieValue(setCookies, name) {
  for (const c of setCookies) {
    const m = c.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
    if (m) return m[1]
  }
  return null
}

/** Replace (or add) sl_access in a request Cookie header, keeping the rest. */
function mergeAccessCookie(existing, accessValue) {
  const parts = existing
    ? existing.split(/;\s*/).filter((p) => p && !p.startsWith('sl_access='))
    : []
  parts.push(`sl_access=${accessValue}`)
  return parts.join('; ')
}

function redirectToLogin(req) {
  // Build the redirect against the original public host the browser actually
  // hit (test.streamia.co), not the internal Caddy → Next hop (localhost:3100).
  const fwdHost = req.headers.get('x-forwarded-host')
  const fwdProto = req.headers.get('x-forwarded-proto') || 'https'
  const baseHost = fwdHost || req.nextUrl.host
  const dest = req.nextUrl.pathname + (req.nextUrl.search || '')
  const target = new URL(`/login?next=${encodeURIComponent(dest)}`, `${fwdProto}://${baseHost}`)
  return NextResponse.redirect(target)
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/network/:path*',
    '/jobs/:path*',
    '/messages/:path*',
    '/leaderboard/:path*',
    '/reviews/:path*',
    '/analytics/:path*',
    '/companies/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/profile-views/:path*',
    '/offers/:path*',
    '/me/:path*',
    '/dashboard/:path*',
    '/dashboard',
  ],
}
