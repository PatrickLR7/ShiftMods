import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCTS_BY_IDS } from '@/lib/shopify/queries'
import type { ShopifyNodesByIdsResponse } from '@/lib/shopify/types'

export async function POST(request: NextRequest) {
  const { ids } = await request.json()

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ products: [] })
  }

  const data = await shopifyFetch<ShopifyNodesByIdsResponse>(GET_PRODUCTS_BY_IDS, { ids })
  const products = data.nodes.filter(Boolean)

  return NextResponse.json({ products })
}
