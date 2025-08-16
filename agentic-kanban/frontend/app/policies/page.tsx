"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/sidebar"
import { mockedAgentPolicies } from "@/lib/types-and-data"
import { Settings, Shield, Zap } from "lucide-react"

const policyIcons = {
  "policy-1": Settings,
  "policy-2": Zap,
  "policy-3": Shield,
}

export default function AgentPolicies() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Policies</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Configure and manage the rules that govern your AI agents
            </p>
          </header>

          <div className="flex-1 overflow-auto p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockedAgentPolicies.map((policy) => {
                const IconComponent = policyIcons[policy.id as keyof typeof policyIcons] || Settings

                return (
                  <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{policy.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {policy.id}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{policy.description}</CardDescription>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">Rules:</h4>
                        <ul className="space-y-2">
                          {policy.rules.map((rule, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
