'use client'

import { useState } from 'react'
import Image from 'next/image'

export type GalleryImage = {
  url: string
  altText: string | null
}

type Props = {
  images: GalleryImage[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex] ?? images[0]

  if (!active) {
    return (
      <div className="aspect-square bg-zinc-100 rounded-sm flex items-center justify-center">
        <span className="text-zinc-400 text-sm">No image</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square bg-zinc-100 rounded-sm overflow-hidden">
        <Image
          key={active.url}
          src={active.url}
          alt={active.altText ?? title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails — only show if more than one image */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={[
                'relative shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors',
                i === activeIndex
                  ? 'border-brand-red'
                  : 'border-transparent hover:border-brand-dark/30',
              ].join(' ')}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
