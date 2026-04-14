'use client'

import type { ProductVariant } from '@/lib/shopify/types'

type Props = {
  variants: ProductVariant[]
  selectedVariantId: string
  onSelect: (variantId: string) => void
}

type OptionMap = Map<string, { value: string; variantId: string; available: boolean }[]>

function buildOptionMap(variants: ProductVariant[]): OptionMap {
  const map: OptionMap = new Map()
  for (const variant of variants) {
    for (const opt of variant.selectedOptions) {
      if (!map.has(opt.name)) map.set(opt.name, [])
      const existing = map.get(opt.name)!
      if (!existing.some((o) => o.value === opt.value)) {
        existing.push({
          value: opt.value,
          variantId: variant.id,
          available: variant.availableForSale,
        })
      }
    }
  }
  return map
}

export default function VariantSelector({ variants, selectedVariantId, onSelect }: Props) {
  const optionMap = buildOptionMap(variants)
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  const handleOptionClick = (optionName: string, optionValue: string) => {
    // Find the variant that matches the new option value while keeping other options the same
    const currentOptions = selectedVariant?.selectedOptions ?? []
    const newOptions = currentOptions.map((opt) =>
      opt.name === optionName ? { ...opt, value: optionValue } : opt,
    )
    const match = variants.find((v) =>
      newOptions.every((newOpt) =>
        v.selectedOptions.some((o) => o.name === newOpt.name && o.value === newOpt.value),
      ),
    )
    if (match) onSelect(match.id)
  }

  return (
    <div className="space-y-4">
      {Array.from(optionMap.entries()).map(([optionName, options]) => {
        const selectedValue = selectedVariant?.selectedOptions.find(
          (o) => o.name === optionName,
        )?.value

        return (
          <div key={optionName}>
            <p className="text-xs font-bold tracking-widest uppercase text-brand-dark/60 mb-2">
              {optionName}:{' '}
              <span className="text-brand-dark normal-case tracking-normal">{selectedValue}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {options.map(({ value, available }) => {
                const isSelected = selectedValue === value
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionClick(optionName, value)}
                    disabled={!available}
                    className={[
                      'px-4 py-2 text-sm font-semibold border transition-colors',
                      isSelected
                        ? 'bg-brand-dark text-white border-brand-dark'
                        : available
                          ? 'bg-white text-brand-dark border-brand-dark/20 hover:border-brand-dark'
                          : 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed line-through',
                    ].join(' ')}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
