import './globals.css'

export const metadata = {
  metadataBase: new URL('https://streamia.co'),
  title: {
    default: 'StreamLink — Professional network for streamers',
    template: '%s · StreamLink',
  },
  description:
    'StreamLink is the professional home for livestreamers. Connect with top streamers, land brand deals, find collaborators and track your growth.',
  applicationName: 'StreamLink',
  keywords: ['streamers', 'livestream', 'creators', 'twitch', 'kick', 'youtube', 'brand deals', 'influencer'],
  openGraph: {
    title: 'StreamLink — Professional network for streamers',
    description:
      'Connect with top streamers, land brand deals, find collaborators and track your growth — all in one professional network built for creators.',
    url: 'https://streamia.co',
    siteName: 'StreamLink',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamLink — Professional network for streamers',
    description: 'The professional home for livestreamers. Free forever for creators.',
  },
  icons: {
    icon: [{ url: '/hummingbird.png', type: 'image/png' }],
    apple: [{ url: '/hummingbird.png' }],
  },
}

export const viewport = {
  themeColor: '#6C63FF',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-gray-900 font-sans antialiased">{children}</body>
    </html>
  )
}
