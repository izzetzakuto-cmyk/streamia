import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import PricingPlans from '@/components/billing/PricingPlans'

export const metadata = {
  title: 'Pricing',
  description: 'Simple plans for streamers, influencers, brands and agencies. Free forever for creators.',
  openGraph: {
    title: 'Streamia pricing',
    description: 'Free forever for streamers. Pro plans for brands and agencies.',
    url: 'https://streamia.co/pricing',
    siteName: 'Streamia',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
            <Logo w={30} />
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
          <div className="absolute -top-24 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4">
            Pricing
          </div>
          <h1 className="text-[40px] md:text-5xl font-extrabold tracking-tight">Simple plans, no surprises</h1>
          <p className="text-gray-500 mt-4 text-[15px]">
            Free forever for streamers. Pro plans for brands and agencies that need to scale.
          </p>
        </div>
      </section>

      <PricingPlans />

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
            <Logo w={26} />
          </Link>
          <div className="md:ml-auto text-[11.5px] text-gray-400">
            © {new Date().getFullYear()} Streamia · Built for streamers, by streamers.
          </div>
        </div>
      </footer>
    </main>
  )
}
