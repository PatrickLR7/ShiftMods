import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/shopify/types'

type EditorialCardData = {
  shortDescription?: string
  editorialTitle?: string
}

type Props = {
  products: Product[]
  heading?: string
  editorialMap?: Record<string, EditorialCardData>
}

export default function ProductGrid({ products, heading, editorialMap }: Props) {
  if (products.length === 0) {
    return (
      <p className="text-center text-zinc-400 py-16 text-sm">No products found.</p>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {heading && (
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-dark mb-8 uppercase">
          {heading}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            shortDescription={editorialMap?.[product.handle]?.shortDescription}
          />
        ))}
      </div>
    </section>
  )
}
