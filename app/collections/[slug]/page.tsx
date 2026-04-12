import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_COLLECTION_BY_HANDLE, GET_ALL_COLLECTIONS } from '@/lib/shopify/queries'
import type {
  ShopifyCollectionResponse,
  ShopifyAllCollectionsResponse,
} from '@/lib/shopify/types'
import ProductGrid from '@/components/ProductGrid'

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const data = await shopifyFetch<ShopifyAllCollectionsResponse>(GET_ALL_COLLECTIONS)
    return data.collections.nodes.map(({ handle }) => ({ slug: handle }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const data = await shopifyFetch<ShopifyCollectionResponse>(GET_COLLECTION_BY_HANDLE, {
      handle: slug,
    })
    if (!data.collection) return {}
    return {
      title: data.collection.title,
      description: data.collection.description || undefined,
    }
  } catch {
    return {}
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params

  let data: ShopifyCollectionResponse
  try {
    data = await shopifyFetch<ShopifyCollectionResponse>(GET_COLLECTION_BY_HANDLE, {
      handle: slug,
    })
  } catch {
    notFound()
  }

  const collection = data.collection
  if (!collection) notFound()

  const products = collection.products.nodes
  const productCount = products.length

  return (
    <>
      {/* Collection header */}
      <div className="bg-brand-dark text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-brand-red text-xs font-bold tracking-[0.3em] uppercase mb-3">
            Collection
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase">
            {collection.title}
          </h1>
          {collection.description && (
            <p className="mt-4 text-white/65 max-w-2xl text-base leading-relaxed">
              {collection.description}
            </p>
          )}
          <p className="mt-6 text-sm text-white/40 font-medium">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </p>
        </div>
      </div>

      {/* Product grid — no editorial data on collection pages (Phase 3) */}
      <ProductGrid products={products} />
    </>
  )
}
