// Streamia brand lockup: the pink hummingbird mark + two-tone wordmark.
// Render it inside a flex row (e.g. a Link with `flex items-center gap-2`)
// that sets the font size; the mark scales via the `w` prop.
export default function Logo({ w = 28 }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hummingbird.png"
        alt="Streamia"
        width={w}
        height={Math.round((w * 267) / 300)}
        className="object-contain"
        style={{ height: 'auto' }}
      />
      <span>
        Stream<span className="text-accent">ia</span>
      </span>
    </>
  )
}
