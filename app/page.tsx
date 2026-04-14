import { sanityFetch } from '@/lib/sanity/client'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_SITE_SETTINGS, GET_EDITORIAL_PRODUCTS_BY_HANDLES } from '@/lib/sanity/queries'
import { GET_FEATURED_PRODUCTS } from '@/lib/shopify/queries'
import type { SiteSettings } from '@/lib/sanity/types'
import type { ShopifyFeaturedProductsResponse } from '@/lib/shopify/types'
import HeroSection from '@/components/HeroSection'
import ProductGrid from '@/components/ProductGrid'

export const revalidate = 60

type EditorialCardData = {
  shopifyHandle: string
  shortDescription?: string
  editorialTitle?: string
}

async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityFetch<SiteSettings | null>(GET_SITE_SETTINGS)
}

async function getFeaturedProducts() {
  try {
    const data = await shopifyFetch<ShopifyFeaturedProductsResponse>(GET_FEATURED_PRODUCTS)
    return data.products.nodes
  } catch {
    return []
  }
}

async function getEditorialMap(handles: string[]): Promise<Record<string, EditorialCardData>> {
  if (handles.length === 0) return {}
  const items = await sanityFetch<EditorialCardData[]>(
    GET_EDITORIAL_PRODUCTS_BY_HANDLES,
    { handles },
  )
  return Object.fromEntries(items.map((ep) => [ep.shopifyHandle, ep]))
}

export default async function HomePage() {
  const [settings, featuredProducts] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
  ])

  const editorialMap = await getEditorialMap(featuredProducts.map((p) => p.handle))

  return (
    <>
      {settings?.heroSection && <HeroSection hero={settings.heroSection} />}

      <ProductGrid
        products={featuredProducts}
        heading="Featured Products"
        editorialMap={editorialMap}
      />
    </>
  )
}
