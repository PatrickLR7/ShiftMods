'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { useCarProfile, useUpdateCarProfile, type BuildGoal, type CarProfileInput } from '@/hooks/useCarProfile'
import { useRecommendations, type RecommendationResponse } from '@/hooks/useRecommendations'
import type { Product } from '@/lib/shopify/types'
import { formatMoney } from '@/lib/utils/format'

const GOAL_OPTIONS: { value: BuildGoal; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'track_performance', label: 'Track Performance' },
  { value: 'daily_driver', label: 'Daily Driver' },
  { value: 'off_road', label: 'Off-Road' },
  { value: 'visual_build', label: 'Visual Build' },
]

const CURRENT_YEAR = new Date().getFullYear()

// ---- Car Profile Form ----

function CarProfileForm() {
  const { data: profile, isLoading } = useCarProfile()
  const update = useUpdateCarProfile()

  const [form, setForm] = useState<CarProfileInput>({
    make: '',
    model: '',
    year: CURRENT_YEAR,
    trim: '',
    goal: 'general',
    notes: '',
  })
  const [saved, setSaved] = useState(false)

  // Pre-populate when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        make: profile.make,
        model: profile.model,
        year: profile.year,
        trim: profile.trim ?? '',
        goal: profile.goal,
        notes: profile.notes ?? '',
      })
    }
  }, [profile])

  function set<K extends keyof CarProfileInput>(key: K, value: CarProfileInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await update.mutateAsync({
      ...form,
      trim: form.trim || undefined,
      notes: form.notes || undefined,
    })
    setSaved(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 rounded bg-brand-dark/10 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
            Make
          </label>
          <input
            required
            value={form.make}
            onChange={(e) => set('make', e.target.value)}
            placeholder="Subaru"
            className="w-full px-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
            Model
          </label>
          <input
            required
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            placeholder="WRX"
            className="w-full px-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
            Year
          </label>
          <input
            required
            type="number"
            min={1980}
            max={CURRENT_YEAR + 1}
            value={form.year}
            onChange={(e) => set('year', Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
            Trim <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            value={form.trim}
            onChange={(e) => set('trim', e.target.value)}
            placeholder="Premium"
            className="w-full px-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
          Build Goal
        </label>
        <select
          value={form.goal}
          onChange={(e) => set('goal', e.target.value as BuildGoal)}
          className="w-full px-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
        >
          {GOAL_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
          Notes <span className="normal-case font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Already has a cold air intake, looking for the next upgrade..."
          className="w-full px-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none"
        />
      </div>

      {update.error && (
        <p className="text-sm text-brand-red">{update.error.message}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={update.isPending}
          className="px-5 py-2.5 rounded bg-brand-red text-white text-sm font-semibold tracking-wide uppercase hover:bg-brand-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {update.isPending ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Profile saved!</span>
        )}
      </div>
    </form>
  )
}

// ---- Recommendation Panel ----

function SkeletonCards() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-brand-dark/60 animate-pulse">Analyzing your build…</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg bg-brand-dark/10 animate-pulse h-64" />
        ))}
      </div>
    </div>
  )
}

function RecommendationResults({
  result,
  reasoning,
}: {
  result: RecommendationResponse
  reasoning: string[]
}) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (result.recommended_product_ids.length === 0) return
    fetch('/api/shopify/products-by-ids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: result.recommended_product_ids }),
    })
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
  }, [result.recommended_product_ids])

  return (
    <div className="space-y-6">
      {/* AI summary */}
      <div className="rounded-lg border border-brand-dark/10 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-red mb-2">
          Build Summary
        </p>
        <p className="text-sm text-brand-dark leading-relaxed">{result.summary}</p>
      </div>

      {/* Product cards */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {products.map((product, i) => (
            <div key={product.id} className="flex flex-col gap-2">
              <ProductCard product={product} />
              {reasoning[i] && (
                <p className="text-xs text-brand-dark/60 px-1 leading-relaxed">
                  <span className="font-semibold text-brand-dark/80">Why: </span>
                  {reasoning[i]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecommendationPanel() {
  const { data: profile } = useCarProfile()
  const recommend = useRecommendations()
  const [budget, setBudget] = useState('')

  const profileSaved = profile !== null && profile !== undefined
  const isRateLimited = recommend.error?.status === 429
  const isNoProfile = recommend.error?.status === 400

  return (
    <div className="space-y-5">
      {/* Budget input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-1.5">
          Budget <span className="normal-case font-normal">(optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40 text-sm">$</span>
          <input
            type="number"
            min={0}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="1500"
            className="w-full pl-7 pr-3 py-2.5 rounded border border-brand-dark/20 bg-white text-sm text-brand-dark placeholder:text-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() =>
          recommend.mutate({ budget_usd: budget ? Number(budget) : null })
        }
        disabled={!profileSaved || recommend.isPending}
        title={!profileSaved ? 'Save your car profile first' : undefined}
        className="w-full py-2.5 px-4 rounded bg-brand-dark text-white text-sm font-semibold tracking-wide uppercase hover:bg-brand-dark/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {recommend.isPending ? 'Analyzing…' : 'Get Recommendations'}
      </button>

      {!profileSaved && (
        <p className="text-xs text-brand-dark/50 text-center">
          Save your car profile to unlock recommendations.
        </p>
      )}

      {/* States */}
      {recommend.isPending && <SkeletonCards />}

      {isRateLimited && (
        <div className="rounded-lg border border-brand-dark/10 bg-white px-5 py-4 text-sm text-brand-dark/70">
          You&apos;ve used all your recommendations for today. Check back tomorrow!
        </div>
      )}

      {isNoProfile && (
        <p className="text-sm text-brand-red">
          Please save your car profile before requesting recommendations.
        </p>
      )}

      {recommend.error && !isRateLimited && !isNoProfile && (
        <p className="text-sm text-brand-red">Something went wrong. Please try again.</p>
      )}

      {recommend.data && (
        <RecommendationResults
          result={recommend.data}
          reasoning={recommend.data.reasoning}
        />
      )}
    </div>
  )
}

// ---- Page ----

export default function GaragePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-brand-dark">My Garage</h1>
        <p className="mt-2 text-brand-dark/60">
          Tell us about your build and get AI-powered product recommendations tailored to your car and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Left — Car Profile */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-6">
              Car Profile
            </h2>
            <CarProfileForm />
          </div>
        </div>

        {/* Right — Recommendations */}
        <div className="lg:col-span-3 lg:border-l lg:border-brand-dark/10 lg:pl-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-dark/50 mb-6">
            Build Recommendations
          </h2>
          <RecommendationPanel />
        </div>
      </div>
    </div>
  )
}
