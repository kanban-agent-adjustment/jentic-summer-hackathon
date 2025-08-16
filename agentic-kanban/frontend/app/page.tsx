"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useInitializeData } from "@/hooks/use-initialize-data"
import { Send, Bot, Sparkles } from "lucide-react"

export default function TaskGenerator() {
  const router = useRouter()
  const initializeDataMutation = useInitializeData()
  const [inputValue, setInputValue] = useState("")
  const [isCreatingTasks, setIsCreatingTasks] = useState(false)

  const handleGenerateTasks = async () => {
    if (!inputValue.trim()) return

    setIsCreatingTasks(true)

    // Create tasks using the API
    initializeDataMutation.mutate(undefined, {
      onSuccess: () => {
        setTimeout(() => {
          setIsCreatingTasks(false)
          router.push('/tasks')
        }, 1000)
      },
      onError: () => {
        setIsCreatingTasks(false)
        // Could add toast notification here if needed
      }
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerateTasks()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Task Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Describe your project and I'll create a Kanban board for you
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Create tasks for a web app project, Organize my marketing campaign..."
                className="flex-1 text-lg"
                disabled={isCreatingTasks}
              />
              <Button 
                onClick={handleGenerateTasks} 
                disabled={isCreatingTasks || !inputValue.trim()}
                size="lg"
                className="px-6"
              >
                {isCreatingTasks ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {isCreatingTasks && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <LoadingSpinner size="sm" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Creating your Kanban board...
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Analyzing your request and generating tasks
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "Create tasks for a web app project",
              "Organize my marketing campaign", 
              "Plan a product launch",
              "Set up a development workflow"
            ].map((example) => (
              <button
                key={example}
                onClick={() => setInputValue(example)}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
