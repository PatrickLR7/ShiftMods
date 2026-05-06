'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

const NAV_LINKS = [
  { label: 'Performance', href: '/collections/performance' },
  { label: 'Off-Road', href: '/collections/offroad' },
  { label: 'Visual', href: '/collections/visual' },
]

type AuthUser = { id: string; email: string; role: string } | null

function UserMenu() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser>(undefined as unknown as AuthUser)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/users/me`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  // Still loading — render nothing to avoid layout shift
  if (user === (undefined as unknown as AuthUser)) return null

  const UserIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Sign in"
        className="flex items-center justify-center w-10 h-10 p-2 text-white hover:text-brand-red transition-colors"
      >
        {UserIcon}
      </Link>
    )
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
        className="flex items-center justify-center w-10 h-10 p-2 text-white hover:text-brand-red transition-colors"
      >
        {UserIcon}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded bg-brand-gray border border-white/10 shadow-xl z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-0.5">Signed in as</p>
            <p className="text-sm text-white truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/garage"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            >
              My Garage
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-brand-red hover:bg-white/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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

        {/* Right side: cart + user + hamburger */}
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

          {/* User menu */}
          <UserMenu />

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
