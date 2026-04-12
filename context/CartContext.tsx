'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from 'react'
import type { Cart, CartLine } from '@/lib/shopify/types'
import {
  createCart,
  addToCart,
  updateCartLine,
  removeCartLine,
  getCart,
} from '@/lib/actions/cart'

type OptimisticCartUpdate =
  | { type: 'ADD'; variantId: string; quantity: number }
  | { type: 'UPDATE'; lineId: string; quantity: number }
  | { type: 'REMOVE'; lineId: string }

type CartContextValue = {
  cart: Cart | null
  isLoading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string, quantity: number) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [, startTransition] = useTransition()

  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    cart,
    (state: Cart | null, update: OptimisticCartUpdate): Cart | null => {
      if (!state) return state

      if (update.type === 'UPDATE') {
        return {
          ...state,
          lines: {
            nodes: state.lines.nodes.map((line) =>
              line.id === update.lineId
                ? { ...line, quantity: update.quantity }
                : line,
            ),
          },
        }
      }

      if (update.type === 'REMOVE') {
        const filtered = state.lines.nodes.filter(
          (line) => line.id !== update.lineId,
        )
        return {
          ...state,
          totalQuantity: state.totalQuantity - (state.lines.nodes.find((l) => l.id === update.lineId)?.quantity ?? 0),
          lines: { nodes: filtered },
        }
      }

      return state
    },
  )

  // Restore or create cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cartId')

    async function initCart() {
      setIsLoading(true)
      try {
        if (stored) {
          const existing = await getCart(stored)
          if (existing) {
            setCart(existing)
            return
          }
        }
        const fresh = await createCart()
        localStorage.setItem('cartId', fresh.id)
        setCart(fresh)
      } finally {
        setIsLoading(false)
      }
    }

    initCart()
  }, [])

  const getCartId = useCallback(async (): Promise<string> => {
    if (cart) return cart.id
    const fresh = await createCart()
    localStorage.setItem('cartId', fresh.id)
    setCart(fresh)
    return fresh.id
  }, [cart])

  const addItem = useCallback(
    async (variantId: string, quantity: number) => {
      setIsLoading(true)
      try {
        const cartId = await getCartId()
        startTransition(() => {
          updateOptimisticCart({ type: 'ADD', variantId, quantity })
        })
        const updated = await addToCart(cartId, variantId, quantity)
        setCart(updated)
      } finally {
        setIsLoading(false)
      }
    },
    [getCartId, updateOptimisticCart],
  )

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return
      setIsLoading(true)
      try {
        startTransition(() => {
          updateOptimisticCart({ type: 'UPDATE', lineId, quantity })
        })
        const updated = await updateCartLine(cart.id, lineId, quantity)
        setCart(updated)
      } finally {
        setIsLoading(false)
      }
    },
    [cart, updateOptimisticCart],
  )

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return
      setIsLoading(true)
      try {
        startTransition(() => {
          updateOptimisticCart({ type: 'REMOVE', lineId })
        })
        const updated = await removeCartLine(cart.id, lineId)
        setCart(updated)
      } finally {
        setIsLoading(false)
      }
    },
    [cart, updateOptimisticCart],
  )

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        isLoading,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
