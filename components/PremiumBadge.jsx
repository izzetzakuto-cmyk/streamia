// Premium badge — the StreamLink hummingbird inside a small rounded rectangle,
// filled with the bird's warm orange tones (#F58635 → #FB523C, sampled from its
// own palette). Shown next to the name on every profile card (profile page,
// public profile, feed, sidebar, leaderboard, lists…) for Premium members
// (`isVerified`). Plain presentational component — safe to use in both server
// and client components.

export default function PremiumBadge({ size = 16, className = '', title = 'Premium' }) {
  // LinkedIn-Premium-style rounded square, but a warm gold→orange gradient
  // (sampled from the bird) rather than LinkedIn's flat mustard — similar, not
  // the same.
  const boxH = Math.round(size * 1.3)
  return (
    <span
      title={title}
      aria-label="Premium member"
      className={`inline-flex items-center justify-center flex-shrink-0 align-middle ${className}`}
      style={{
        width: boxH + 4,
        height: boxH,
        borderRadius: Math.max(4, Math.round(boxH * 0.26)),
        background: 'linear-gradient(135deg, #F6A621 0%, #F5732A 100%)',
        boxShadow: '0 1px 2px rgba(245, 115, 42, 0.4)',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          backgroundColor: '#fff',
          WebkitMaskImage: 'url(/brand/icon.svg)',
          maskImage: 'url(/brand/icon.svg)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    </span>
  )
}
