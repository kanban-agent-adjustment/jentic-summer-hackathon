'use client'

import { useApiHealth } from '@/hooks/use-api-health'
import { Wifi, WifiOff } from 'lucide-react'

export function ApiStatus() {
  const { data, isLoading, error } = useApiHealth()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Connecting...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <WifiOff className="w-4 h-4" />
        <span>API Offline</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-500">
      <Wifi className="w-4 h-4" />
      <span>API Online</span>
    </div>
  )
}
