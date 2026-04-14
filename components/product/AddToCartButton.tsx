'use client'

import { useFormStatus } from 'react-dom'
import { useCart } from '@/context/CartContext'

// Child component reads useFormStatus — must be inside the <form>
function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  const busy = pending || disabled

  return (
    <button
      type="submit"
      disabled={busy}
      className={[
        'w-full py-4 font-bold tracking-widest text-sm uppercase transition-all duration-150',
        busy
          ? 'bg-brand-dark/40 text-white/60 cursor-not-allowed'
          : 'bg-brand-red hover:bg-brand-red/85 active:scale-[0.98] text-white',
      ].join(' ')}
    >
      {pending ? 'Adding…' : 'Add to Cart'}
    </button>
  )
}

type Props = {
  variantId: string
  availableForSale: boolean
}

export default function AddToCartButton({ variantId, availableForSale }: Props) {
  const { addItem, openCart } = useCart()

  async function formAction() {
    if (!availableForSale || !variantId) return
    await addItem(variantId, 1)
    openCart()
  }

  return (
    <form action={formAction}>
      <SubmitButton disabled={!availableForSale} />
      {!availableForSale && (
        <p className="mt-2 text-center text-xs text-zinc-400 uppercase tracking-widest">
          Out of stock
        </p>
      )}
    </form>
  )
}
