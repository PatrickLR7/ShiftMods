import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, ApiError } from '@/lib/api-client'

export type RecommendationResponse = {
  summary: string
  recommended_product_ids: string[]
  reasoning: string[]
}

export type RecommendationQuota = {
  used: number
  limit: number | null
  remaining: number | null
  is_admin: boolean
}

const QUOTA_KEY = ['recommendation-quota']
const LATEST_KEY = ['recommendations', 'latest']

export function useRecommendations() {
  const queryClient = useQueryClient()

  return useMutation<RecommendationResponse, ApiError, { budget_usd?: number | null }>({
    mutationFn: (body) => apiPost<RecommendationResponse>('/ai/recommend', body),
    onSuccess: (data) => {
      queryClient.setQueryData(LATEST_KEY, data)
      queryClient.invalidateQueries({ queryKey: QUOTA_KEY })
    },
  })
}

export function useLatestRecommendation() {
  return useQuery<RecommendationResponse | null>({
    queryKey: LATEST_KEY,
    queryFn: () => null,
    staleTime: Infinity,
  })
}

export function useRecommendationQuota() {
  return useQuery<RecommendationQuota>({
    queryKey: QUOTA_KEY,
    queryFn: () => apiGet<RecommendationQuota>('/ai/recommend/quota'),
    staleTime: 1000 * 60,
  })
}
