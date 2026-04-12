export type SanityImage = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export type HeroSection = {
  _type: 'heroSection'
  _id: string
  headline: string
  subheadline: string
  ctaText: string
  ctaLink: string
  backgroundImage: SanityImage
}

export type EditorialProductSpec = {
  _key: string
  label: string
  value: string
}

export type EditorialProduct = {
  _type: 'editorialProduct'
  _id: string
  shopifyHandle: string
  editorialTitle?: string
  shortDescription?: string
  longDescription?: unknown[] // PortableText blocks
  specs?: EditorialProductSpec[]
  editorialImages?: SanityImage[]
  categories?: Array<
    | 'sport'
    | 'tuner'
    | 'offroad'
    | 'crossover'
    | 'interior'
    | 'exterior'
    | 'performance'
    | 'audio'
  >
}

export type SiteSettings = {
  _type: 'siteSettings'
  _id: string
  siteTitle: string
  siteDescription: string
  heroSection: HeroSection
  featuredCollectionHandle: string
}
