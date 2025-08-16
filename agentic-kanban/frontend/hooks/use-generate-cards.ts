import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { cardKeys } from './use-cards'

export function useGenerateCards() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userInput: string) => {
      try {
        // Call the new backend agent endpoint
        const response = await apiClient.generateCardsWithAgent(userInput)
        return response
      } catch (error) {
        console.error('Error generating cards with agent:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidate and refetch cards list
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    },
  })
}