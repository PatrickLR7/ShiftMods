import { useMutation } from '@tanstack/react-query'
import { apiPost, ApiError } from '@/lib/api-client'

export type RecommendationResponse = {
  summary: string
  recommended_product_ids: string[]
  reasoning: string[]
}

export function useRecommendations() {
  return useMutation<RecommendationResponse, ApiError, { budget_usd?: number | null }>({
    mutationFn: (body) => apiPost<RecommendationResponse>('/ai/recommend', body),
    // staleTime doesn't apply to mutations; the last result is held in mutation.data
  })
}
