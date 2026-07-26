import Link from 'next/link'
import { ArrowRight, Award, Building2, Check, Crown, Sparkles, Zap } from 'lucide-react'
import UpgradeCta from '@/components/billing/UpgradeCta'

export const metadata = {
  title: 'Pricing',
  description:
    'Free for streamers · Premium $9.99/mo · Brand Starter from $199/mo · Featured $399/mo. Built for creators, streamers, influencers and the brands that pay them.',
  openGraph: {
    title: 'StreamLink pricing',
    description: 'Free for streamers. Premium $9.99/mo. Brand plans from $199/mo with a 7-day free trial.',
    url: 'https://streamia.co/pricing',
    siteName: 'StreamLink',
  },
}

// Two audiences, two rows: creators first, then brands. Pricing matches the
// PDF brief delivered for Faz 8.
const PLANS = [
  // ── Streamers + influencers ──────────────────────────────────────────────
  {
    id: 'basic',
    audience: 'creator',
    name: 'Basic',
    Icon: Award,
    iconBg: 'bg-gray-100 text-gray-700',
    price: 0,
    period: 'forever',
    description: 'Get started for free',
    cardClass: 'border-gray-200',
    cta: 'Create free account',
    ctaHref: '/register',
    ctaClass: 'border border-gray-300 text-gray-700 hover:border-gray-500',
    features: [
      'Full streamer / influencer profile',
      'Browse the creator network',
      'Up to 10 job applications / month',
      'Direct DM with creators (10 / month — see Brand limits below)',
    ],
  },
  {
    id: 'premium',
    audience: 'creator',
    name: 'Streamer Premium',
    Icon: Crown,
    iconBg: 'bg-accent-lt text-accent',
    price: 9.99,
    period: 'month',
    description: 'For serious creators',
    cardClass: 'border-accent ring-2 ring-accent/20',
    badge: 'Most popular for creators',
    cta: 'Upgrade · $9.99/mo',
    ctaHref: '/login?next=/pricing',
    ctaClass: 'btn-gradient text-white focus:ring-2 focus:ring-accent-pink/40',
    features: [
      'See who viewed your profile',
      'Blue verified badge',
      'Silent Mode — browse without appearing in viewer lists',
      'Boosted visibility in search + suggestions',
    ],
  },
  // ── Brands + agencies ───────────────────────────────────────────────────
  {
    id: 'starter',
    audience: 'brand',
    name: 'Brand Starter',
    Icon: Building2,
    iconBg: 'bg-amber-50 text-amber-700',
    price: 199,
    period: 'month',
    description: 'For brands ready to scale',
    cardClass: 'border-amber-200',
    cta: 'Start 7-day free trial',
    ctaHref: '/register/company',
    ctaClass: 'btn-gradient text-white focus:ring-2 focus:ring-accent-pink/40',
    trialBadge: '7-day free trial',
    features: [
      'Direct message streamers + influencers',
      'Full creator profile access',
      'Save creators to favourites',
      'Unlimited contact within plan',
    ],
  },
  {
    id: 'featured',
    audience: 'brand',
    name: 'Brand Featured',
    Icon: Sparkles,
    iconBg: 'bg-purple-100 text-purple-700',
    price: 399,
    period: 'month',
    description: 'For brands serious about growth',
    cardClass: 'border-purple-300 ring-2 ring-purple-200',
    badge: 'For serious growth',
    cta: 'Start 7-day free trial',
    ctaHref: '/register/company',
    ctaClass: 'btn-gradient text-white focus:ring-2 focus:ring-accent-pink/40',
    trialBadge: '7-day free trial',
    features: [
      'Everything in Brand Starter',
      'Pinned to top of Companies page',
      'Featured placement platform-wide',
      'Priority access to streamers + influencers',
    ],
  },
]

function PlanCard({ plan }) {
  const { id, name, Icon, iconBg, price, period, description, cardClass, badge, trialBadge, cta, ctaHref, ctaClass, features } = plan
  // Use the right glyph for cents so $9.99 doesn't look like $9.
  const [whole, cents] = String(price).split('.')

  return (
    <div className={`relative bg-white border rounded-2xl p-7 ${cardClass}`}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-accent text-white text-[10.5px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
          {badge}
        </div>
      )}
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg}`}>
        <Icon className="w-5 h-5" strokeWidth={2.25} />
      </div>
      <div className="mt-5">
        <div className="text-[14px] font-extrabold uppercase tracking-wider text-gray-500">{name}</div>
        <div className="text-[12px] text-gray-400 mt-0.5">{description}</div>
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-[40px] font-extrabold tracking-tight">${whole}</span>
        {cents && <span className="text-[20px] font-extrabold text-gray-400 tracking-tight">.{cents}</span>}
        <span className="text-[13px] text-gray-400 font-semibold ml-1">/ {period}</span>
      </div>
      {trialBadge && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
          <Check className="w-3 h-3" strokeWidth={3} /> {trialBadge}
        </div>
      )}
      {price > 0 ? (
        <UpgradeCta plan={id} className={`mt-5 inline-flex items-center justify-center w-full h-[52px] rounded-xl text-[15px] font-bold tracking-wide font-display transition ${ctaClass}`}>
          {cta}
        </UpgradeCta>
      ) : (
        <Link href={ctaHref} className={`mt-5 inline-flex items-center justify-center w-full h-[52px] rounded-xl text-[15px] font-bold tracking-wide font-display transition ${ctaClass}`}>
          {cta}
        </Link>
      )}
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600">
            <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={3} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PricingPage() {
  const creatorPlans = PLANS.filter((p) => p.audience === 'creator')
  const brandPlans = PLANS.filter((p) => p.audience === 'brand')

  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-6">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icon.svg" alt="StreamLink" className="h-9 w-auto" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition">
              Get started <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/3 w-96 h-96 bg-aurora rounded-full blur-3xl opacity-60" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4">
            Pricing
          </div>
          <h1 className="text-[40px] md:text-5xl font-extrabold tracking-tight">Built for the people in front of, and behind, the camera</h1>
          <p className="text-gray-500 mt-4 text-[15px]">
            Free for creators — paid plans for brands and agencies that need to scale. Cancel anytime; the 7-day brand trial doesn&apos;t charge until day 8.
          </p>
        </div>
      </section>

      {/* Creators row */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-micro font-mono font-extrabold uppercase text-gray-500">For creators</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {creatorPlans.map((p) => <PlanCard key={p.id} plan={p} />)}
        </div>
      </section>

      {/* Brands row */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-micro font-mono font-extrabold uppercase text-gray-500">For brands &amp; agencies</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {brandPlans.map((p) => <PlanCard key={p.id} plan={p} />)}
        </div>
        <p className="text-[12px] text-gray-400 mt-4 max-w-3xl">
          Free brand accounts can DM up to 10 distinct creators per month. Paid brand plans remove the cap and unlock featured placement.
        </p>
      </section>

      {/* Job-posting pricing — Block D ships the live paywall; this row is informative now. */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-micro font-mono font-extrabold uppercase text-gray-500">Sponsored job listings</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-7">
          <div className="flex items-start gap-3">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 text-amber-700">
              <Zap className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-extrabold uppercase tracking-wider text-gray-500">Pay per listing</div>
              <div className="text-[13px] text-gray-500 mt-0.5">Post sponsorships, ambassador roles, and campaign briefs directly to streamers + influencers.</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            {[
              { days: 7,  price: 29 },
              { days: 14, price: 49 },
              { days: 30, price: 79 },
            ].map(({ days, price }) => (
              <div key={days} className="border border-gray-200 rounded-xl p-4 text-center">
                <div className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">{days} days live</div>
                <div className="text-[28px] font-extrabold tracking-tight mt-1">${price}</div>
                <div className="text-[11px] text-gray-400">one-time</div>
              </div>
            ))}
          </div>
          <Link href="/register/company" className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition">
            Create a brand page to post a job <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-wordmark.svg" alt="StreamLink" className="h-6 w-auto" />
          </Link>
          <div className="md:ml-auto text-[11.5px] text-gray-400">
            © {new Date().getFullYear()} StreamLink · Built for streamers, by streamers.
          </div>
        </div>
      </footer>
    </main>
  )
}
