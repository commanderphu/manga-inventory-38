"use client"

import { useState, useEffect, useCallback } from "react"
import { mangaAPI, type Manga, type CreateMangaRequest, type UpdateMangaRequest } from "@/lib/api"

interface Filters {
  genre: string
  autor: string
  verlag: string
  sprache: string
  status: string
  band: string
}

interface UseMangaReturn {
  mangas: Manga[]
  loading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  stats: any

  // Actions
  fetchMangas: (
    filters?: Partial<Filters>,
    searchTerm?: string,
    pageNum?: number,
    pageSize?: number,
    sortKey?: keyof Manga | null,
    sortDirection?: "asc" | "desc" | null,
  ) => Promise<void>
  createManga: (manga: CreateMangaRequest) => Promise<void>
  updateManga: (id: string, manga: UpdateMangaRequest) => Promise<void>
  deleteManga: (id: string) => Promise<void>
  deleteMangas: (ids: string[]) => Promise<void>
  importMangas: (file: File) => Promise<{ imported: number; errors: string[] }>
  fetchStats: () => Promise<void>

  // Pagination
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
}

export function useManga(): UseMangaReturn {
  const [mangas, setMangas] = useState<Manga[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [stats, setStats] = useState<any>(null)

  const fetchMangas = useCallback(
    async (
      filters?: Partial<Filters>,
      searchTerm?: string,
      pageNum?: number,
      pageSize?: number,
      sortKey?: keyof Manga | null,
      sortDirection?: "asc" | "desc" | null,
    ) => {
      setLoading(true)
      setError(null)

      try {
        const params = {
          page: pageNum || page,
          limit: pageSize || 20,
          search: searchTerm || "",
          ...filters,
        }

        const response = await mangaAPI.getMangas(params)

        // Apply client-side sorting if specified
        let sortedData = response.data.data
        if (sortKey && sortDirection) {
          sortedData = [...response.data.data].sort((a, b) => {
            const aValue = a[sortKey]
            const bValue = b[sortKey]

            if (aValue === null || aValue === undefined) return 1
            if (bValue === null || bValue === undefined) return -1

            if (typeof aValue === "string" && typeof bValue === "string") {
              const comparison = aValue.localeCompare(bValue)
              return sortDirection === "asc" ? comparison : -comparison
            }

            if (typeof aValue === "number" && typeof bValue === "number") {
              return sortDirection === "asc" ? aValue - bValue : bValue - aValue
            }

            if (typeof aValue === "boolean" && typeof bValue === "boolean") {
              return sortDirection === "asc" ? (aValue ? 1 : -1) : bValue ? 1 : -1
            }

            return 0
          })
        }

        setMangas(sortedData)
        setTotal(response.data.total)
        setTotalPages(response.data.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch manga")
        console.error("Error fetching manga:", err)
      } finally {
        setLoading(false)
      }
    },
    [page],
  )

  const createManga = useCallback(
    async (manga: CreateMangaRequest) => {
      setLoading(true)
      setError(null)

      try {
        await mangaAPI.createManga(manga)
        // Refresh the list
        await fetchMangas()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create manga")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchMangas],
  )

  const updateManga = useCallback(async (id: string, manga: UpdateMangaRequest) => {
    setLoading(true)
    setError(null)

    try {
      await mangaAPI.updateManga(id, manga)
      // Update local state
      setMangas((prev) => prev.map((m) => (m.id === id ? { ...m, ...manga } : m)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update manga")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteManga = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await mangaAPI.deleteManga(id)
      // Remove from local state
      setMangas((prev) => prev.filter((m) => m.id !== id))
      setTotal((prev) => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete manga")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteMangas = useCallback(async (ids: string[]) => {
    setLoading(true)
    setError(null)

    try {
      await mangaAPI.deleteMangas(ids)
      // Remove from local state
      setMangas((prev) => prev.filter((m) => !ids.includes(m.id)))
      setTotal((prev) => prev - ids.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete manga")
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const importMangas = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)

      try {
        const result = await mangaAPI.importMangas(file)
        // Refresh the list after import
        await fetchMangas()
        return result.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to import manga")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fetchMangas],
  )

  const fetchStats = useCallback(async () => {
    try {
      const response = await mangaAPI.getStats()
      setStats(response.data)
    } catch (err) {
      console.error("Error fetching stats:", err)
    }
  }, [])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage((prev) => prev + 1)
    }
  }, [page, totalPages])

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1)
    }
  }, [page])

  // Fetch stats on mount only
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    mangas,
    loading,
    error,
    total,
    page,
    totalPages,
    stats,

    fetchMangas,
    createManga,
    updateManga,
    deleteManga,
    deleteMangas,
    importMangas,
    fetchStats,

    setPage,
    nextPage,
    prevPage,
  }
}
