/**
 * ISR strategy for product pages:
 * - revalidate = 3600 → Next.js re-generates the page at most once per hour.
 * - On-demand: POST /api/revalidate (from Sanity webhook) calls revalidateTag('sanity'),
 *   which busts the Sanity data immediately when editorial content is published.
 * - Shopify product data (price, variants, availability) is tagged 'shopify' and
 *   revalidated via revalidateTag('shopify') when cart actions run.
 */
export const revalidate = 3600

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { shopifyFetch } from '@/lib/shopify/client'
import { sanityClient } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/client'
import { GET_PRODUCT_BY_HANDLE, GET_ALL_PRODUCTS } from '@/lib/shopify/queries'
import { GET_EDITORIAL_PRODUCT } from '@/lib/sanity/queries'
import type {
  ShopifyProductResponse,
  ShopifyAllProductsResponse,
} from '@/lib/shopify/types'
import type { EditorialProduct } from '@/lib/sanity/types'
import { formatMoney } from '@/lib/utils/format'
import ProductGallery, { type GalleryImage } from '@/components/product/ProductGallery'
import ProductInteractions from '@/components/product/ProductInteractions'
import PortableTextRenderer from '@/components/product/PortableTextRenderer'

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateStaticParams() {
  try {
    const data = await shopifyFetch<ShopifyAllProductsResponse>(GET_ALL_PRODUCTS)
    return data.products.nodes.map(({ handle }) => ({ handle }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  try {
    const data = await shopifyFetch<ShopifyProductResponse>(GET_PRODUCT_BY_HANDLE, { handle })
    if (!data.product) return {}
    return {
      title: data.product.title,
      description: data.product.description.slice(0, 160) || undefined,
    }
  } catch {
    return {}
  }
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params

  // Core "bridge pattern" — both sources fetched in parallel
  const [shopifyData, editorialData] = await Promise.all([
    shopifyFetch<ShopifyProductResponse>(GET_PRODUCT_BY_HANDLE, { handle }).catch(() => null),
    sanityClient
      .fetch<EditorialProduct | null>(GET_EDITORIAL_PRODUCT, { handle })
      .catch(() => null),
  ])

  const product = shopifyData?.product
  if (!product) notFound()

  const variants = product.variants.nodes
  const price = product.priceRange.minVariantPrice

  // Normalize images: Shopify first, then Sanity editorial images appended
  const shopifyImages: GalleryImage[] = product.images.nodes.map((img) => ({
    url: img.url,
    altText: img.altText,
  }))
  const editorialImages: GalleryImage[] =
    editorialData?.editorialImages?.map((img) => ({
      url: urlFor(img).width(800).height(800).auto('format').url(),
      altText: null,
    })) ?? []
  const allImages: GalleryImage[] = [...shopifyImages, ...editorialImages]

  const description =
    editorialData?.shortDescription ?? product.description

  const hasEditorial =
    editorialData &&
    (editorialData.longDescription?.length || editorialData.specs?.length)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Above the fold: gallery + info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Gallery */}
        <ProductGallery images={allImages} title={product.title} />

        {/* Info panel */}
        <div className="flex flex-col gap-6">
          {/* Breadcrumb tag */}
          {product.tags[0] && (
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-brand-red">
              {product.tags[0]}
            </p>
          )}

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-brand-dark">
            {product.title}
          </h1>

          <p className="text-2xl font-black text-brand-dark">
            {formatMoney(price.amount, price.currencyCode)}
          </p>

          {description && (
            <p className="text-zinc-600 leading-relaxed text-sm sm:text-base">
              {description}
            </p>
          )}

          <div className="border-t border-zinc-100 pt-6">
            <ProductInteractions variants={variants} />
          </div>
        </div>
      </div>

      {/* Below the fold: editorial section */}
      {hasEditorial && (
        <div className="mt-20 border-t border-zinc-200 pt-14">
          <h2 className="text-2xl font-black tracking-tight uppercase text-brand-dark mb-10">
            About This Part
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Long description */}
            {editorialData.longDescription && editorialData.longDescription.length > 0 && (
              <PortableTextRenderer value={editorialData.longDescription} />
            )}

            {/* Specs table */}
            {editorialData.specs && editorialData.specs.length > 0 && (
              <div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-brand-dark/50 mb-4">
                  Specifications
                </h3>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {editorialData.specs.map((spec) => (
                      <tr
                        key={spec._key}
                        className="block sm:table-row border-b border-zinc-100 last:border-0"
                      >
                        <td className="block sm:table-cell py-1 sm:py-3 pr-4 font-semibold text-brand-dark/60 sm:w-2/5 align-top pt-3 sm:pt-3">
                          {spec.label}
                        </td>
                        <td className="block sm:table-cell pb-3 sm:py-3 font-medium text-brand-dark align-top">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
