"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card as TaskCard } from "@/lib/api"
import { Calendar, Clock, Tag, User } from "lucide-react"
import { format } from "date-fns"

interface TaskDetailDialogProps {
  task: TaskCard | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  research: { label: "Research", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  planned: { label: "Planned", color: "bg-blue-100 text-blue-800 border-blue-300" },
  "in-progress": { label: "In Progress", color: "bg-orange-100 text-orange-800 border-orange-300" },
  blocked: { label: "Blocked", color: "bg-red-100 text-red-800 border-red-300" },
  done: { label: "Done", color: "bg-green-100 text-green-800 border-green-300" },
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  if (!task) return null

  const status = statusConfig[task.status]
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold pr-6">
            {task.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status and Order */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className={`${status.color} border`}>
                {status.label}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Order: {task.order}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {task.description || "No description provided"}
            </p>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Created:</span>
                {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Updated:</span>
                {format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}
              </div>
              {task.completedAt && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">Completed:</span>
                  {format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              )}
            </div>
          </div>

          {/* Task ID for debugging/reference */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Task ID: {task.id}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}