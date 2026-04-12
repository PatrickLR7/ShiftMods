import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/client'
import type { HeroSection as HeroSectionType } from '@/lib/sanity/types'

type Props = {
  hero: HeroSectionType
}

export default function HeroSection({ hero }: Props) {
  const imageUrl = urlFor(hero.backgroundImage).width(1800).height(1000).auto('format').url()

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-end overflow-hidden">
      <Image
        src={imageUrl}
        alt={hero.headline}
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Dark gradient overlay — stronger at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent" />

      <div className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <p className="text-brand-red text-xs font-bold tracking-[0.3em] uppercase mb-4">
          ShiftMods
        </p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight max-w-3xl">
          {hero.headline}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/75 max-w-xl leading-relaxed">
          {hero.subheadline}
        </p>
        <Link
          href={hero.ctaLink}
          className="mt-8 inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red/85 active:scale-95 text-white font-bold tracking-widest text-sm uppercase px-8 py-4 transition-all duration-150"
        >
          {hero.ctaText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
