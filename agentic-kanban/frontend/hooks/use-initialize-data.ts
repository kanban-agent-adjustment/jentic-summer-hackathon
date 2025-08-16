import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type CreateCardRequest } from '@/lib/api'
import { cardKeys } from './use-cards'

// Use fixed timestamp to avoid hydration mismatches
const fixedTimestamp = new Date('2025-08-16T16:00:00.000Z').toISOString()

const sampleCards = [
  {
    id: crypto.randomUUID(),
    title: "Research Kanban best practices",
    description: "Explore various Kanban methodologies and tools to inform application design.",
    status: "research" as const,
    order: 1,
    tags: ["kanban", "research", "design"],
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    completedAt: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Implement chat interface loading state",
    description: "Add a visual loading indicator and setTimeout for agent response simulation.",
    status: "in-progress" as const,
    order: 2,
    tags: ["frontend", "ui", "mocking"],
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    completedAt: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Design Kanban board layout",
    description: "Create wireframes and mockups for the task management page columns and cards.",
    status: "planned" as const,
    order: 3,
    tags: ["design", "ui", "ux"],
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    completedAt: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Set up React-Query for task fetching",
    description: "Integrate react-query for efficient data management of tasks from the API.",
    status: "planned" as const,
    order: 4,
    tags: ["frontend", "react-query", "data"],
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    completedAt: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Develop drag-and-drop functionality",
    description: "Implement interactive drag-and-drop for moving tasks between Kanban columns.",
    status: "blocked" as const,
    order: 5,
    tags: ["frontend", "interaction", "kanban"],
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    completedAt: null,
  },
  {
    id: crypto.randomUUID(),
    title: "Define initial agent policies",
    description: "Outline basic rules for agent behavior and task generation.",
    status: "research" as const,
    order: 6,
    tags: ["agent", "policy", "backend"],
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
    completedAt: null,
  },
]

export function useInitializeData() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const request: CreateCardRequest = { cards: sampleCards }
      const response = await apiClient.createCards(request)
      return response
    },
    onSuccess: () => {
      // Invalidate and refetch cards list
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    },
  })
}
