"use client"

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { LoadingColumn, LoadingSpinner } from "@/components/ui/loading-spinner"
import { useCards, useOptimisticUpdateCard } from "@/hooks/use-cards"
import { useInitializeData } from "@/hooks/use-initialize-data"
import type { Card as TaskCard } from "@/lib/api"
import { toast, Toaster } from "sonner"
import { ApiStatus } from "@/components/api-status"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const statusColumns = {
  research: { title: "Research", color: "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20" },
  planned: { title: "Planned", color: "bg-blue-100 border-blue-300 dark:bg-blue-900/20" },
  "in-progress": { title: "In Progress", color: "bg-orange-100 border-orange-300 dark:bg-orange-900/20" },
  blocked: { title: "Blocked", color: "bg-red-100 border-red-300 dark:bg-red-900/20" },
  done: { title: "Done", color: "bg-green-100 border-green-300 dark:bg-green-900/20" },
}

export default function TaskManagement() {
  const { data: tasks = [], isLoading, error } = useCards()
  const updateCardMutation = useOptimisticUpdateCard()
  const initializeDataMutation = useInitializeData()

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId) return

    const newStatus = destination.droppableId as TaskCard["status"]
    const updates = {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
    }

    updateCardMutation.mutate(
      { id: draggableId, updates },
      {
        onSuccess: () => {
          toast.success(`Task moved to ${statusColumns[newStatus].title}`)
        },
        onError: () => {
          toast.error('Failed to update task status')
        },
      }
    )
  }

  const getTasksByStatus = (status: TaskCard["status"]) => tasks.filter((task) => task.status === status)

  // Handle empty state
  if (!isLoading && !error && tasks.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Organize and track your tasks with our intelligent Kanban board
                  </p>
                </div>
                <ApiStatus />
              </div>
            </header>
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-gray-500 mb-6">
                  <h2 className="text-xl font-semibold mb-2">No tasks found</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get started by adding some sample tasks to your Kanban board
                  </p>
                </div>
                <Button
                  onClick={() => {
                    initializeDataMutation.mutate(undefined, {
                      onSuccess: () => {
                        toast.success('Sample tasks added successfully!')
                      },
                      onError: () => {
                        toast.error('Failed to add sample tasks')
                      },
                    })
                  }}
                  disabled={initializeDataMutation.isPending}
                  className="gap-2"
                >
                  {initializeDataMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {initializeDataMutation.isPending ? 'Adding tasks...' : 'Add Sample Tasks'}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Organize and track your tasks with our intelligent Kanban board
                  </p>
                </div>
                <ApiStatus />
              </div>
            </header>
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 h-full">
                {Object.entries(statusColumns).map(([status, config]) => (
                  <LoadingColumn key={status} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Organize and track your tasks with our intelligent Kanban board
                  </p>
                </div>
                <ApiStatus />
              </div>
            </header>
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <h2 className="text-xl font-semibold">Failed to load tasks</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Organize and track your tasks with our intelligent Kanban board
                </p>
                {updateCardMutation.isPending && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <LoadingSpinner size="sm" />
                    <span>Updating task...</span>
                  </div>
                )}
              </div>
              <ApiStatus />
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 h-full">
                {Object.entries(statusColumns).map(([status, config]) => (
                  <div key={status} className="flex flex-col">
                    <div className={`rounded-lg border-2 border-dashed p-4 mb-4 ${config.color}`}>
                      <h2 className="font-semibold text-lg text-center">{config.title}</h2>
                      <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-1">
                        {getTasksByStatus(status as TaskCard["status"]).length} tasks
                      </p>
                    </div>

                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 space-y-3 p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? "bg-gray-100 dark:bg-gray-800" : ""
                          }`}
                        >
                          {getTasksByStatus(status as TaskCard["status"]).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-grab active:cursor-grabbing transition-shadow ${
                                    snapshot.isDragging ? "shadow-lg rotate-2" : "hover:shadow-md"
                                  }`}
                                >
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <CardDescription className="text-xs mb-3">{task.description}</CardDescription>
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {task.tags.map((tag) => (
                                          <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  )
}
