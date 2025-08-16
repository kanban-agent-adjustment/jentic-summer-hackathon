"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI task management assistant. I can help you create, organize, and manage your tasks. What would you like to work on today?",
      sender: "agent",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate agent response with setTimeout
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAgentResponse(inputValue),
        sender: "agent",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, agentResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAgentResponse = (userInput: string): string => {
    const responses = [
      "I understand you'd like help with that. Let me analyze your request and suggest some task organization strategies.",
      "That's a great idea! I can help you break that down into manageable tasks. Would you like me to create a task breakdown for you?",
      "I've processed your request. Based on what you've told me, I recommend organizing this into several phases. Let me suggest a structure.",
      "Excellent! I can see how this fits into your workflow. I'll help you prioritize and organize these tasks effectively.",
      "I'm analyzing the best approach for this. Consider breaking this into smaller, actionable items that we can track on your Kanban board.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Task Assistant</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Chat with your intelligent task management assistant</p>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`${
                  message.sender === "user"
                    ? "ml-auto bg-blue-600 text-white max-w-2xl"
                    : "mr-auto bg-white dark:bg-gray-800 max-w-2xl"
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {message.sender === "user" ? (
                      <>
                        <User className="h-4 w-4" />
                        You
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4" />
                        AI Assistant
                      </>
                    )}
                    <span className="text-xs opacity-70 ml-auto">{message.timestamp.toLocaleTimeString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm">{message.content}</p>
                </CardContent>
              </Card>
            ))}

            {isLoading && (
              <Card className="mr-auto bg-white dark:bg-gray-800 max-w-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Bot className="h-4 w-4" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto flex gap-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about task management..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
