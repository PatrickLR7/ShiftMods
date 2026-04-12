// ---- Fragments ----
// Each fragment is defined exactly once. Parent fragments spread child
// fragment strings directly — no fragment re-embeds another that already
// includes a shared fragment, which would produce duplicate definitions.

const MONEY_FRAGMENT = /* GraphQL */ `
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
`

const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment Image on Image {
    url
    altText
    width
    height
  }
`

// Spreads Money — does NOT re-embed MONEY_FRAGMENT (parent handles it)
const PRODUCT_VARIANT_FRAGMENT = /* GraphQL */ `
  fragment ProductVariant on ProductVariant {
    id
    title
    availableForSale
    price {
      ...Money
    }
    selectedOptions {
      name
      value
    }
  }
`

// Embeds IMAGE + MONEY + PRODUCT_VARIANT exactly once each
const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment Product on Product {
    id
    handle
    title
    description
    descriptionHtml
    tags
    featuredImage {
      ...Image
    }
    images(first: 20) {
      nodes {
        ...Image
      }
    }
    priceRange {
      minVariantPrice {
        ...Money
      }
    }
    variants(first: 50) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`

// Spreads Money + Image — parent (CART_FRAGMENT) embeds those definitions
const CART_LINE_FRAGMENT = /* GraphQL */ `
  fragment CartLine on CartLine {
    id
    quantity
    merchandise {
      ... on ProductVariant {
        id
        title
        price {
          ...Money
        }
        selectedOptions {
          name
          value
        }
        product {
          id
          handle
          title
          featuredImage {
            ...Image
          }
        }
      }
    }
    cost {
      totalAmount {
        ...Money
      }
    }
  }
`

// Embeds MONEY + IMAGE + CART_LINE exactly once each
const CART_FRAGMENT = /* GraphQL */ `
  fragment Cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    lines(first: 100) {
      nodes {
        ...CartLine
      }
    }
  }
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}
  ${CART_LINE_FRAGMENT}
`

// ---- Queries ----

export const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`

// IMAGE_FRAGMENT is already inside PRODUCT_FRAGMENT — not repeated here
export const GET_COLLECTION_BY_HANDLE = /* GraphQL */ `
  query GetCollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image {
        ...Image
      }
      products(first: 12) {
        nodes {
          ...Product
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const GET_FEATURED_PRODUCTS = /* GraphQL */ `
  query GetFeaturedProducts {
    products(first: 8, query: "tag:featured") {
      nodes {
        ...Product
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const GET_CART = /* GraphQL */ `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`

export const GET_ALL_COLLECTIONS = /* GraphQL */ `
  query GetAllCollections {
    collections(first: 50) {
      nodes {
        handle
      }
    }
  }
`

// ---- Mutations ----

export const CREATE_CART = /* GraphQL */ `
  mutation CreateCart {
    cartCreate {
      cart {
        ...Cart
      }
    }
  }
  ${CART_FRAGMENT}
`

export const ADD_TO_CART = /* GraphQL */ `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...Cart
      }
    }
  }
  ${CART_FRAGMENT}
`

export const UPDATE_CART = /* GraphQL */ `
  mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...Cart
      }
    }
  }
  ${CART_FRAGMENT}
`

export const REMOVE_FROM_CART = /* GraphQL */ `
  mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...Cart
      }
    }
  }
  ${CART_FRAGMENT}
`
