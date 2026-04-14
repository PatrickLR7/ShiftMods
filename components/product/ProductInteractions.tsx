'use client'

import { useState } from 'react'
import VariantSelector from './VariantSelector'
import AddToCartButton from './AddToCartButton'
import type { ProductVariant } from '@/lib/shopify/types'

type Props = {
  variants: ProductVariant[]
}

const DEFAULT_VARIANT_TITLE = 'Default Title'

export default function ProductInteractions({ variants }: Props) {
  const defaultVariant =
    variants.find((v) => v.availableForSale) ?? variants[0]

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    defaultVariant?.id ?? '',
  )

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const hasRealOptions =
    variants.length > 1 ||
    (variants[0]?.selectedOptions[0]?.value !== DEFAULT_VARIANT_TITLE)

  return (
    <div className="space-y-5">
      {hasRealOptions && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />
      )}
      <AddToCartButton
        variantId={selectedVariantId}
        availableForSale={selectedVariant?.availableForSale ?? false}
      />
    </div>
  )
}
