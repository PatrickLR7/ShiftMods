export type Money = {
  amount: string
  currencyCode: string
}

export type ShopifyImage = {
  url: string
  altText: string | null
  width: number
  height: number
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  selectedOptions: { name: string; value: string }[]
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  featuredImage: ShopifyImage
  images: { nodes: ShopifyImage[] }
  priceRange: { minVariantPrice: Money }
  variants: { nodes: ProductVariant[] }
  tags: string[]
}

export type Collection = {
  id: string
  handle: string
  title: string
  description: string
  image: ShopifyImage | null
  products: { nodes: Product[] }
}

export type CartItem = {
  variantId: string
  quantity: number
}

export type CartLine = {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    product: Pick<Product, 'id' | 'handle' | 'title' | 'featuredImage'>
    price: Money
    selectedOptions: { name: string; value: string }[]
  }
  cost: {
    totalAmount: Money
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: Money
    totalAmount: Money
    totalTaxAmount: Money | null
  }
  lines: { nodes: CartLine[] }
}

// --- GraphQL response wrappers ---

export type ShopifyProductResponse = {
  product: Product
}

export type ShopifyCollectionResponse = {
  collection: Collection
}

export type ShopifyFeaturedProductsResponse = {
  products: { nodes: Product[] }
}

export type ShopifyCartResponse = {
  cart: Cart
}

export type ShopifyCreateCartResponse = {
  cartCreate: { cart: Cart }
}

export type ShopifyAddToCartResponse = {
  cartLinesAdd: { cart: Cart }
}

export type ShopifyUpdateCartResponse = {
  cartLinesUpdate: { cart: Cart }
}

export type ShopifyRemoveFromCartResponse = {
  cartLinesRemove: { cart: Cart }
}

export type ShopifyAllCollectionsResponse = {
  collections: { nodes: { handle: string }[] }
}
