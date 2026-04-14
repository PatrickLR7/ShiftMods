'use server'

import { revalidateTag } from 'next/cache'
import { shopifyFetch } from '@/lib/shopify/client'
import {
  CREATE_CART,
  ADD_TO_CART,
  UPDATE_CART,
  REMOVE_FROM_CART,
  GET_CART,
} from '@/lib/shopify/queries'
import type {
  Cart,
  ShopifyCartResponse,
  ShopifyCreateCartResponse,
  ShopifyAddToCartResponse,
  ShopifyUpdateCartResponse,
  ShopifyRemoveFromCartResponse,
} from '@/lib/shopify/types'

export async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<ShopifyCreateCartResponse>(CREATE_CART)
  revalidateTag('shopify-cart', 'max')
  return data.cartCreate.cart
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<Cart> {
  const data = await shopifyFetch<ShopifyAddToCartResponse>(ADD_TO_CART, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  })
  revalidateTag('shopify-cart', 'max')
  return data.cartLinesAdd.cart
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await shopifyFetch<ShopifyUpdateCartResponse>(UPDATE_CART, {
    cartId,
    lines: [{ id: lineId, quantity }],
  })
  revalidateTag('shopify-cart', 'max')
  return data.cartLinesUpdate.cart
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
): Promise<Cart> {
  const data = await shopifyFetch<ShopifyRemoveFromCartResponse>(REMOVE_FROM_CART, {
    cartId,
    lineIds: [lineId],
  })
  revalidateTag('shopify-cart', 'max')
  return data.cartLinesRemove.cart
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<ShopifyCartResponse>(GET_CART, { cartId })
  revalidateTag('shopify-cart', 'max')
  return data.cart ?? null
}
