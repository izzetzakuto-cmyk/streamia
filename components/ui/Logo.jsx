// StreamLink brand logo — the official logotype (wordmark + hummingbird).
// Sized by height (`h`, px); width follows the artwork's 640×191 aspect ratio.
export default function Logo({ h = 28, className = '' }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/streamlink_logo.png"
      alt="StreamLink"
      width={Math.round((h * 640) / 191)}
      height={h}
      className={`object-contain ${className}`}
      style={{ height: h, width: 'auto' }}
    />
  )
}
