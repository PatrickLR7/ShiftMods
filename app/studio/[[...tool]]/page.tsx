export const dynamic = 'force-dynamic'
export { metadata, viewport } from 'next-sanity/studio'

import StudioLoader from './StudioLoader'

export default function StudioPage() {
  return <StudioLoader />
}
