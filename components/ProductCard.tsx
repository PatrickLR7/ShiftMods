import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/shopify/types'

type Props = {
  product: Product
  shortDescription?: string
}

function formatMoney(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}

export default function ProductCard({ product, shortDescription }: Props) {
  const { handle, title, featuredImage, priceRange, tags } = product
  const price = priceRange.minVariantPrice

  return (
    <Link
      href={`/products/${handle}`}
      className="group flex flex-col bg-white rounded-sm shadow-sm hover:shadow-md border border-transparent hover:border-brand-red/20 transition-all duration-200 overflow-hidden"
    >
      {/* Image — 60% of card height via aspect ratio */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-100">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-200" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {tags[0] && (
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-red">
            {tags[0]}
          </p>
        )}
        <h3 className="font-bold text-brand-dark text-sm leading-snug line-clamp-2 tracking-tight">
          {title}
        </h3>
        {shortDescription && (
          <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 flex-1">
            {shortDescription}
          </p>
        )}
        <p className="mt-auto pt-2 font-black text-base text-brand-dark tracking-tight">
          {formatMoney(price.amount, price.currencyCode)}
        </p>
      </div>
    </Link>
  )
}
