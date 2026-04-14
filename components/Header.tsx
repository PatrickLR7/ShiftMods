'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

const NAV_LINKS = [
  { label: 'Performance', href: '/collections/performance' },
  { label: 'Off-Road', href: '/collections/offroad' },
  { label: 'Visual', href: '/collections/visual' },
]

export default function Header() {
  const { cart, openCart } = useCart()
  const itemCount = cart?.totalQuantity ?? 0
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-brand-dark border-b border-white/10">
      {/* Main bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/shift-mods.png"
            alt="ShiftMods"
            width={140}
            height={36}
            priority
            className="h-9 w-auto"
          />
        </Link>

        {/* Primary nav — desktop only */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold tracking-widest uppercase text-white/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side: cart + hamburger */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <button
            onClick={openCart}
            aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            className="relative flex items-center justify-center w-10 h-10 p-2 text-white hover:text-brand-red transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-brand-red text-white text-[10px] font-bold leading-none">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="lg:hidden flex items-center justify-center w-10 h-10 p-2 text-white hover:text-brand-red transition-colors"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden bg-brand-dark border-t border-white/10"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block py-4 px-6 text-sm font-semibold tracking-widest uppercase text-white hover:text-brand-red transition-colors border-b border-white/5 last:border-0"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
