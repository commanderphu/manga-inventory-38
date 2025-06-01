const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface Manga {
  id: string
  titel: string
  band: string
  genre: string
  autor: string
  verlag: string
  isbn: string
  sprache: string
  coverImage: string
  read: boolean
  double: boolean
  newbuy: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateMangaRequest extends Omit<Manga, "id" | "createdAt" | "updatedAt"> {}
export interface UpdateMangaRequest extends Partial<CreateMangaRequest> {}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// API Client Class
class MangaAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // GET all manga with optional filters
  async getMangas(params?: {
    page?: number
    limit?: number
    search?: string
    genre?: string
    autor?: string
    verlag?: string
    sprache?: string
    status?: string
    band?: string
  }): Promise<ApiResponse<PaginatedResponse<Manga>>> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/manga${queryString ? `?${queryString}` : ""}`

    return this.request<PaginatedResponse<Manga>>(endpoint)
  }

  // GET single manga by ID
  async getManga(id: string): Promise<ApiResponse<Manga>> {
    return this.request<Manga>(`/manga/${id}`)
  }

  // POST create new manga
  async createManga(manga: CreateMangaRequest): Promise<ApiResponse<Manga>> {
    return this.request<Manga>("/manga", {
      method: "POST",
      body: JSON.stringify(manga),
    })
  }

  // PUT update manga
  async updateManga(id: string, manga: UpdateMangaRequest): Promise<ApiResponse<Manga>> {
    return this.request<Manga>(`/manga/${id}`, {
      method: "PUT",
      body: JSON.stringify(manga),
    })
  }

  // DELETE manga
  async deleteManga(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/manga/${id}`, {
      method: "DELETE",
    })
  }

  // DELETE multiple manga
  async deleteMangas(ids: string[]): Promise<ApiResponse<void>> {
    return this.request<void>("/manga/bulk-delete", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    })
  }

  // POST import manga from Excel
  async importMangas(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append("file", file)

    return this.request<{ imported: number; errors: string[] }>("/manga/import", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  }

  // GET export manga as Excel
  async exportMangas(filters?: any): Promise<Blob> {
    const searchParams = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/manga/export${queryString ? `?${queryString}` : ""}`

    const response = await fetch(`${API_BASE_URL}${endpoint}`)

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }

    return response.blob()
  }

  // GET statistics
  async getStats(): Promise<
    ApiResponse<{
      total: number
      read: number
      doubles: number
      newbuys: number
      byGenre: Record<string, number>
      byAutor: Record<string, number>
      byVerlag: Record<string, number>
    }>
  > {
    return this.request<any>("/manga/stats")
  }

  // GET metadata for ISBN
  async getISBNMetadata(isbn: string): Promise<ApiResponse<Partial<Manga>>> {
    return this.request<Partial<Manga>>(`/manga/isbn?isbn=${isbn}`)
  }
}

export const mangaAPI = new MangaAPI()
