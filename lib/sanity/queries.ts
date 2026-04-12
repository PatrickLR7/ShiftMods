export const GET_SITE_SETTINGS = /* groq */ `
  *[_type == "siteSettings"][0] {
    _type,
    _id,
    siteTitle,
    siteDescription,
    featuredCollectionHandle,
    heroSection-> {
      _type,
      _id,
      headline,
      subheadline,
      ctaText,
      ctaLink,
      backgroundImage
    }
  }
`

export const GET_EDITORIAL_PRODUCT = /* groq */ `
  *[_type == "editorialProduct" && shopifyHandle == $handle][0] {
    _type,
    _id,
    shopifyHandle,
    editorialTitle,
    shortDescription,
    longDescription,
    specs[] {
      _key,
      label,
      value
    },
    editorialImages,
    categories
  }
`

export const GET_EDITORIAL_PRODUCTS_BY_HANDLES = /* groq */ `
  *[_type == "editorialProduct" && shopifyHandle in $handles] {
    shopifyHandle,
    shortDescription,
    editorialTitle
  }
`

export const GET_ALL_EDITORIAL_PRODUCTS = /* groq */ `
  *[_type == "editorialProduct"] | order(_createdAt desc) {
    _type,
    _id,
    shopifyHandle,
    editorialTitle,
    shortDescription,
    categories
  }
`
