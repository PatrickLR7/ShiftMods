'use client'

import dynamic from 'next/dynamic'

// dynamic with ssr: false must live in a Client Component (Next.js 16 restriction).
// This prevents the RSC-vendored React shim from stripping createContext.
const Studio = dynamic(() => import('./StudioClient'), { ssr: false })

export default function StudioLoader() {
  return <Studio />
}
