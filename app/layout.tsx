import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/Header'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ShiftMods',
    template: '%s | ShiftMods',
  },
  description: 'Performance parts and accessories for sport, tuner, crossover, and off-road builds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans bg-brand-light text-brand-dark">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="bg-brand-dark text-white/60 mt-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-center">
              © {new Date().getFullYear()} ShiftMods. All rights reserved.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  )
}
