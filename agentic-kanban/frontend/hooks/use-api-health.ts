import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export function useApiHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const response = await apiClient.healthCheck()
      return response
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    retryDelay: 1000,
  })
}
