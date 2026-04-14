'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { formatMoney } from '@/lib/utils/format'

export default function CartDrawer() {
  const { cart, isOpen, isLoading, closeCart, updateItem, removeItem } = useCart()

  const lines = cart?.lines.nodes ?? []

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={[
          'fixed inset-0 z-40 bg-black/60 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={[
          'fixed right-0 top-0 z-50 h-full w-full sm:max-w-sm md:max-w-md bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <h2 className="text-base font-black tracking-tight uppercase text-brand-dark">
            Your Build Cart
            {cart && cart.totalQuantity > 0 && (
              <span className="ml-2 text-brand-red">({cart.totalQuantity})</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-zinc-400 hover:text-brand-dark transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-12 h-12 text-zinc-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
              </svg>
              <p className="text-sm text-zinc-400">Your cart is empty.</p>
              <button
                onClick={closeCart}
                className="text-sm font-bold text-brand-red underline underline-offset-2"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {lines.map((line) => {
                const { merchandise } = line
                const image = merchandise.product.featuredImage

                return (
                  <li key={line.id} className="flex gap-4 py-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-zinc-100">
                      {image && (
                        <Image
                          src={image.url}
                          alt={image.altText ?? merchandise.product.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col flex-1 min-w-0 gap-1 overflow-hidden">
                      <Link
                        href={`/products/${merchandise.product.handle}`}
                        onClick={closeCart}
                        className="text-sm font-bold text-brand-dark leading-snug line-clamp-2 hover:text-brand-red transition-colors truncate"
                      >
                        {merchandise.product.title}
                      </Link>
                      {merchandise.title !== 'Default Title' && (
                        <p className="text-xs text-zinc-400">{merchandise.title}</p>
                      )}
                      <p className="text-sm font-bold text-brand-dark mt-auto">
                        {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Remove */}
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        aria-label="Remove item"
                        className="text-zinc-300 hover:text-brand-red transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Quantity */}
                      <div className="flex items-center border border-zinc-200 rounded-sm shrink-0">
                        <button
                          onClick={() => {
                            if (line.quantity === 1) removeItem(line.id)
                            else updateItem(line.id, line.quantity - 1)
                          }}
                          disabled={isLoading}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-zinc-50 transition-colors disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          aria-label="Increase quantity"
                          className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-zinc-50 transition-colors disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {lines.length > 0 && cart && (
          <div className="border-t border-zinc-100 px-6 py-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-bold text-brand-dark">
                {formatMoney(
                  cart.cost.subtotalAmount.amount,
                  cart.cost.subtotalAmount.currencyCode,
                )}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Taxes and shipping calculated at checkout.
            </p>
            <a
              href={cart.checkoutUrl}
              className="block w-full text-center bg-brand-red hover:bg-brand-red/85 text-white font-bold tracking-widest text-sm uppercase py-4 transition-colors"
            >
              Checkout
            </a>
            <button
              onClick={closeCart}
              className="block w-full text-center text-sm font-semibold text-zinc-400 hover:text-brand-dark transition-colors py-1"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
