import './globals.css'

export const metadata = {
  metadataBase: new URL('https://streamia.co'),
  title: {
    default: 'Streamia — Professional network for streamers',
    template: '%s · Streamia',
  },
  description:
    'Streamia is the professional home for livestreamers. Connect with top streamers, land brand deals, find collaborators and track your growth.',
  applicationName: 'Streamia',
  keywords: ['streamers', 'livestream', 'creators', 'twitch', 'kick', 'youtube', 'brand deals', 'influencer'],
  openGraph: {
    title: 'Streamia — Professional network for streamers',
    description:
      'Connect with top streamers, land brand deals, find collaborators and track your growth — all in one professional network built for creators.',
    url: 'https://streamia.co',
    siteName: 'Streamia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streamia — Professional network for streamers',
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
