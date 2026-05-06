import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut } from '@/lib/api-client'

export type BuildGoal =
  | 'track_performance'
  | 'daily_driver'
  | 'off_road'
  | 'visual_build'
  | 'general'

export type CarProfile = {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  trim: string | null
  goal: BuildGoal
  notes: string | null
  updated_at: string
}

export type CarProfileInput = {
  make: string
  model: string
  year: number
  trim?: string
  goal: BuildGoal
  notes?: string
}

export function useCarProfile() {
  return useQuery<CarProfile | null>({
    queryKey: ['car-profile'],
    queryFn: () => apiGet<CarProfile | null>('/users/me/car-profile'),
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateCarProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CarProfileInput) =>
      apiPut<CarProfile>('/users/me/car-profile', input),
    onSuccess: (updated) => {
      queryClient.setQueryData(['car-profile'], updated)
    },
  })
}
