import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { cardKeys } from './use-cards'

export function useDeleteAllCards() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.deleteAllCards()
      return response
    },
    onSuccess: () => {
      // Invalidate and refetch cards list
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    },
  })
}