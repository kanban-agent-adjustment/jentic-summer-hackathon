// API Configuration
export const API_BASE_URL = 'http://localhost:8000'

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Card {
  id: string
  title: string
  description: string
  status: "research" | "in-progress" | "done" | "blocked" | "planned"
  order: number
  createdAt: string
  updatedAt: string
  tags?: string[]
  completedAt?: string
}

export interface CreateCardRequest {
  cards: Omit<Card, 'id'>[]
}

export interface UpdateCardRequest {
  title?: string
  description?: string
  status?: Card['status']
  order?: number
  tags?: string[]
  completedAt?: string
}

// API Client
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Cards API
  async getCards(): Promise<ApiResponse<Card[]>> {
    return this.request<Card[]>('/api/cards')
  }

  async getCard(id: string): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${id}`)
  }

  async createCards(cards: CreateCardRequest): Promise<ApiResponse<null>> {
    return this.request<null>('/api/cards', {
      method: 'POST',
      body: JSON.stringify(cards),
    })
  }

  async updateCard(id: string, updates: UpdateCardRequest): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteCard(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/cards/${id}`, {
      method: 'DELETE',
    })
  }

  // Health check
  async healthCheck(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/')
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
