import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId) throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set')
if (!dataset) throw new Error('NEXT_PUBLIC_SANITY_DATASET is not set')

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
})

export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const builder = createImageUrlBuilder(sanityClient)

type SanityImageSource = Parameters<typeof builder.image>[0]

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
