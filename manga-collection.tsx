"use client"

import type React from "react"

import { useState, useRef, useMemo, useEffect, useCallback, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Search,
  BookOpen,
  Copy,
  ShoppingCart,
  Upload,
  Filter,
  X,
  Star,
  Heart,
  Sparkles,
  Loader2,
  RefreshCw,
  Camera,
  Barcode,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
} from "lucide-react"
import { useManga } from "@/hooks/useManga"
import type { Manga, CreateMangaRequest } from "@/lib/api"
import { mangaAPI } from "@/lib/api"
import { SimpleISBNScanner } from "@/components/simple-isbn-scanner"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Filters {
  genre: string
  autor: string
  verlag: string
  sprache: string
  status: string
  band: string
}

interface SortConfig {
  key: keyof Manga | null
  direction: "asc" | "desc" | null
}

// Enhanced Pagination Component
function EnhancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false,
}: {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  loading?: boolean
}) {
  const [jumpToPage, setJumpToPage] = useState("")
  const [showJumpInput, setShowJumpInput] = useState(false)

  const handleJumpToPage = () => {
    const pageNum = Number.parseInt(jumpToPage)
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
      setJumpToPage("")
      setShowJumpInput(false)
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-t border-purple-100 px-4 py-6">
      <div className="flex flex-col space-y-4">
        {/* Info Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-purple-700">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">
                {startItem}-{endItem} von {totalItems.toLocaleString()} Manga
              </span>
            </div>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-purple-500" />}
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-purple-700">Einträge pro Seite:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                // This would need to be implemented in the parent component
                console.log("Change page size to:", value)
              }}
              disabled={loading}
            >
              <SelectTrigger className="w-20 h-8 border-purple-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Quick Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || loading}
              className="h-9 px-3 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Erste</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="h-9 px-3 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Zurück</span>
            </Button>
          </div>

          {/* Center: Page Numbers */}
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === "...") {
                return (
                  <div key={`dots-${index}`} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 text-purple-600 hover:bg-purple-100"
                      onClick={() => setShowJumpInput(!showJumpInput)}
                      disabled={loading}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {showJumpInput && (
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-white border border-purple-200 rounded-lg shadow-lg p-3 min-w-[120px]">
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Seite"
                              value={jumpToPage}
                              onChange={(e) => setJumpToPage(e.target.value)}
                              className="h-8 w-16 text-center border-purple-200"
                              min={1}
                              max={totalPages}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleJumpToPage()
                                } else if (e.key === "Escape") {
                                  setShowJumpInput(false)
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={handleJumpToPage}
                              className="h-8 px-2 bg-purple-600 hover:bg-purple-700"
                            >
                              →
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-center">1-{totalPages}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              const pageNum = page as number
              const isActive = pageNum === currentPage

              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  disabled={loading}
                  className={`h-9 w-9 transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105 border-0"
                      : "border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:scale-105"
                  }`}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          {/* Right: Quick Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="h-9 px-3 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <span className="hidden sm:inline mr-1">Weiter</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="h-9 px-3 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
            >
              <span className="hidden sm:inline mr-1">Letzte</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Compact View */}
        <div className="sm:hidden">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 5))}
              disabled={currentPage <= 5 || loading}
              className="h-8 px-2 border-purple-200"
            >
              -5
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="h-8 px-2 border-purple-200"
            >
              -1
            </Button>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-md text-sm font-medium min-w-[60px] text-center">
              {currentPage}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="h-8 px-2 border-purple-200"
            >
              +1
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 5))}
              disabled={currentPage >= totalPages - 4 || loading}
              className="h-8 px-2 border-purple-200"
            >
              +5
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-purple-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function MangaCollectionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    mangas,
    loading,
    error,
    total,
    stats,
    fetchMangas,
    createManga,
    updateManga,
    deleteManga,
    deleteMangas,
    importMangas,
    fetchStats,
  } = useManga()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMangas, setSelectedMangas] = useState<string[]>([])
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [isLoadingISBN, setIsLoadingISBN] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState<Filters>({
    genre: searchParams.get("genre") || "",
    autor: searchParams.get("autor") || "",
    verlag: searchParams.get("verlag") || "",
    sprache: searchParams.get("sprache") || "",
    status: searchParams.get("status") || "unread",
    band: searchParams.get("band") || "",
  })

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: (searchParams.get("sort") as keyof Manga) || "titel",
    direction: (searchParams.get("direction") as "asc" | "desc") || "asc",
  })

  const [newManga, setNewManga] = useState<CreateMangaRequest>({
    titel: "",
    band: "",
    genre: "",
    autor: "",
    verlag: "",
    isbn: "",
    sprache: "",
    coverImage: "/placeholder.svg?height=120&width=80",
    read: false,
    double: false,
    newbuy: false,
  })

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)
  const pageSize = 20

  const totalPages = Math.ceil(total / pageSize)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      // Reset page to 1 when filters or search changes
      if (name !== "page") {
        params.set("page", "1")
      }

      return params.toString()
    },
    [searchParams],
  )

  const updateURL = useCallback(
    (newFilters: Filters, newSearchTerm: string, newSortConfig: SortConfig, newPage: number) => {
      const params = new URLSearchParams()

      // Set filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      // Set search term
      if (newSearchTerm) {
        params.set("search", newSearchTerm)
      }

      // Set sort config
      if (newSortConfig.key && newSortConfig.direction) {
        params.set("sort", newSortConfig.key.toString())
        params.set("direction", newSortConfig.direction)
      }

      // Set page
      if (newPage > 1) {
        params.set("page", newPage.toString())
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router],
  )

  // Initialize page from URL on component mount
  useEffect(() => {
    const urlPage = Number(searchParams.get("page")) || 1
    if (urlPage !== page) {
      setPage(urlPage)
    }
  }, [searchParams]) // Only run when searchParams change

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateURL(filters, searchTerm, sortConfig, newPage)
  }

  // Filter options from existing data
  const filterOptions = useMemo(() => {
    const genres = [...new Set(mangas.flatMap((m) => m.genre.split(",").map((g) => g.trim())).filter(Boolean))]
    const autors = [...new Set(mangas.map((m) => m.autor).filter(Boolean))]
    const verlags = [...new Set(mangas.map((m) => m.verlag).filter(Boolean))]
    const sprachen = [...new Set(mangas.map((m) => m.sprache).filter(Boolean))]
    const bands = [...new Set(mangas.map((m) => m.band).filter(Boolean))].sort(
      (a, b) => Number.parseInt(a) - Number.parseInt(b),
    )

    return { genres, autors, verlags, sprachen, bands }
  }, [mangas])

  // Apply filters and search
  useEffect(() => {
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""))

    // Use a timeout to debounce the search
    const timeoutId = setTimeout(() => {
      fetchMangas(activeFilters, searchTerm, page, pageSize, sortConfig.key, sortConfig.direction)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters, searchTerm, page, pageSize, sortConfig, fetchMangas]) // Add fetchMangas back to dependencies

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      genre: "",
      autor: "",
      verlag: "",
      sprache: "",
      status: "unread",
      band: "",
    })
    setSearchTerm("")
    setSortConfig({ key: "titel", direction: "asc" })
    updateURL(
      {
        genre: "",
        autor: "",
        verlag: "",
        sprache: "",
        status: "unread",
        band: "",
      },
      "",
      { key: "titel", direction: "asc" },
      1,
    )
  }

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)

  // Handle ISBN scan
  const handleISBNScan = async (isbn: string) => {
    setIsScannerOpen(false)
    setIsLoadingISBN(true)

    try {
      const response = await mangaAPI.getISBNMetadata(isbn)

      if (response.data) {
        setNewManga({
          ...newManga,
          ...response.data,
          isbn: isbn,
        })
        setIsAddDialogOpen(true)

        setImportStatus({
          type: "success",
          message: `ISBN ${isbn} erfolgreich gescannt und Metadaten geladen! 📚`,
        })
      }
    } catch (error) {
      console.error("Error fetching ISBN metadata:", error)
      setImportStatus({
        type: "error",
        message: `ISBN ${isbn} gescannt, aber keine Metadaten gefunden. 😢`,
      })
    } finally {
      setIsLoadingISBN(false)
    }
  }

  // Manual ISBN lookup
  const handleISBNLookup = async (isbn: string) => {
    if (!isbn || isbn.length < 10) return

    setIsLoadingISBN(true)

    try {
      const response = await mangaAPI.getISBNMetadata(isbn)

      if (response.data) {
        setNewManga({
          ...newManga,
          ...response.data,
          isbn: isbn,
        })

        setImportStatus({
          type: "success",
          message: `Metadaten für ISBN ${isbn} erfolgreich geladen! 📚`,
        })
      }
    } catch (error) {
      console.error("Error fetching ISBN metadata:", error)
      setImportStatus({
        type: "error",
        message: `Keine Metadaten für ISBN ${isbn} gefunden. 😢`,
      })
    } finally {
      setIsLoadingISBN(false)
    }
  }

  // ADD Function
  const handleAddManga = async () => {
    if (!newManga.titel) {
      setImportStatus({
        type: "error",
        message: "Titel ist erforderlich! 📝",
      })
      return
    }

    try {
      await createManga(newManga)
      setNewManga({
        titel: "",
        band: "",
        genre: "",
        autor: "",
        verlag: "",
        isbn: "",
        sprache: "",
        coverImage: "/placeholder.svg?height=120&width=80",
        read: false,
        double: false,
        newbuy: false,
      })
      setIsAddDialogOpen(false)
      setImportStatus({
        type: "success",
        message: "Manga erfolgreich hinzugefügt! ✨",
      })
      await fetchStats()
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Fehler beim Hinzufügen des Manga! 😅",
      })
    }
  }

  // DELETE Functions
  const handleDeleteManga = async (id: string) => {
    try {
      await deleteManga(id)
      setImportStatus({
        type: "success",
        message: "Manga erfolgreich gelöscht! 🗑️",
      })
      await fetchStats()
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Fehler beim Löschen des Manga! 😅",
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await deleteMangas(selectedMangas)
      setSelectedMangas([])
      setImportStatus({
        type: "success",
        message: `${selectedMangas.length} Manga erfolgreich gelöscht! 💥`,
      })
      await fetchStats()
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Fehler beim Löschen der Manga! 😅",
      })
    }
  }

  // Selection Functions
  const handleSelectManga = (id: string) => {
    setSelectedMangas((prev) => (prev.includes(id) ? prev.filter((mangaId) => mangaId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedMangas.length === mangas.length) {
      setSelectedMangas([])
    } else {
      setSelectedMangas(mangas.map((manga) => manga.id))
    }
  }

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await importMangas(file)
      setImportStatus({
        type: "success",
        message: `${result.imported} Manga erfolgreich importiert! 🚀${result.errors.length > 0 ? ` (${result.errors.length} Fehler)` : ""}`,
      })
      setIsImportDialogOpen(false)
      await fetchStats()

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Fehler beim Importieren der Excel-Datei. Bitte überprüfe das Format. 😅",
      })
    }
  }

  // Clear status after 3 seconds
  useEffect(() => {
    if (importStatus.type) {
      const timer = setTimeout(() => {
        setImportStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [importStatus.type])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-16 w-12" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )

  const handleSort = (key: keyof Manga) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
    updateURL(filters, searchTerm, { key, direction }, page)
  }

  const getSortIndicator = (key: keyof Manga) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼"
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col space-y-4">
          {/* Header with anime styling */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-pink-500" />
              Manga Collection
              <Heart className="h-8 w-8 text-purple-500" />
            </h1>
            <p className="text-muted-foreground">Deine persönliche Manga-Bibliothek ✨</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-400 bg-red-50 shadow-lg">
              <AlertDescription className="font-medium text-red-700">
                {error}
                <Button variant="outline" size="sm" onClick={() => fetchMangas()} className="ml-2">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Erneut versuchen
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Import Status Alert */}
          {importStatus.type && (
            <Alert
              className={`${importStatus.type === "success" ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"} shadow-lg`}
            >
              <AlertDescription className="font-medium">{importStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards with anime colors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Gesamt</p>
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-12 bg-white/20" /> : stats?.total || total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Gelesen</p>
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-12 bg-white/20" /> : stats?.read || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Copy className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Doppelt</p>
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-12 bg-white/20" /> : stats?.doubles || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <div>
                    <p className="text-sm opacity-90">Neu kaufen</p>
                    <p className="text-2xl font-bold">
                      {loading ? <Skeleton className="h-8 w-12 bg-white/20" /> : stats?.newbuys || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Titel, Autor oder Genre... 🔍"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    updateURL(filters, e.target.value, sortConfig, 1)
                  }}
                  className="pl-10 border-2 border-purple-200 focus:border-purple-400 shadow-sm"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-purple-200 hover:bg-purple-50 w-full"
                  disabled={loading}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter {activeFiltersCount > 0 && <Badge className="ml-2 bg-purple-500">{activeFiltersCount}</Badge>}
                </Button>

                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50 w-full" disabled={loading}>
                      <Upload className="h-4 w-4 mr-2" />
                      <span>Excel Import</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-purple-700">Excel-Datei importieren 📊</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-2">Erwartete Excel-Spalten:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>title</li>
                          <li>band</li>
                          <li>genre</li>
                          <li>isbn</li>
                          <li>new_buy</li>
                          <li>double</li>
                          <li>read</li>
                        </ul>
                        <p className="mt-3 text-xs">Fehlende Felder werden automatisch ergänzt.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="excel-file">Excel-Datei auswählen</Label>
                        <Input
                          id="excel-file"
                          type="file"
                          ref={fileInputRef}
                          accept=".xlsx,.xls"
                          onChange={handleExcelImport}
                          className="border-purple-200"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* ISBN Scanner Dialog */}
                <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-green-200 hover:bg-green-50 w-full" disabled={loading}>
                      <Barcode className="h-4 w-4 mr-2" />
                      <span>ISBN Scannen</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-purple-700">ISBN scannen 📷</DialogTitle>
                    </DialogHeader>
                    <SimpleISBNScanner onScan={handleISBNScan} onClose={() => setIsScannerOpen(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg w-full"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>Manga hinzufügen</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-purple-700">Neues Manga hinzufügen ✨</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="titel">Titel *</Label>
                        <Input
                          id="titel"
                          value={newManga.titel}
                          onChange={(e) => setNewManga({ ...newManga, titel: e.target.value })}
                          placeholder="Manga-Titel"
                          className="border-purple-200 focus:border-purple-400"
                          disabled={loading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="band">Band</Label>
                          <Input
                            id="band"
                            value={newManga.band}
                            onChange={(e) => setNewManga({ ...newManga, band: e.target.value })}
                            placeholder="Band-Nr."
                            className="border-purple-200 focus:border-purple-400"
                            disabled={loading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sprache">Sprache</Label>
                          <Input
                            id="sprache"
                            value={newManga.sprache}
                            onChange={(e) => setNewManga({ ...newManga, sprache: e.target.value })}
                            placeholder="Deutsch"
                            className="border-purple-200 focus:border-purple-400"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="genre">Genre</Label>
                        <Input
                          id="genre"
                          value={newManga.genre}
                          onChange={(e) => setNewManga({ ...newManga, genre: e.target.value })}
                          placeholder="z.B. Shonen, Action"
                          className="border-purple-200 focus:border-purple-400"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="autor">Autor</Label>
                        <Input
                          id="autor"
                          value={newManga.autor}
                          onChange={(e) => setNewManga({ ...newManga, autor: e.target.value })}
                          placeholder="Autor-Name"
                          className="border-purple-200 focus:border-purple-400"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="verlag">Verlag</Label>
                        <Input
                          id="verlag"
                          value={newManga.verlag}
                          onChange={(e) => setNewManga({ ...newManga, verlag: e.target.value })}
                          placeholder="Verlag"
                          className="border-purple-200 focus:border-purple-400"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="isbn">ISBN</Label>
                            <Input
                              id="isbn"
                              value={newManga.isbn}
                              onChange={(e) => setNewManga({ ...newManga, isbn: e.target.value })}
                              placeholder="ISBN-Nummer"
                              className="border-purple-200 focus:border-purple-400"
                              disabled={loading || isLoadingISBN}
                            />
                          </div>
                          <div className="flex flex-col justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleISBNLookup(newManga.isbn)}
                              disabled={loading || isLoadingISBN || !newManga.isbn}
                              className="h-10 w-10"
                            >
                              {isLoadingISBN ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Search className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex flex-col justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setIsScannerOpen(true)}
                              disabled={loading || isLoadingISBN}
                              className="h-10 w-10"
                            >
                              <Camera className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tipp: Scanne die ISBN mit der Kamera oder gib sie manuell ein und klicke auf die Lupe, um
                          Metadaten zu laden.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coverImage">Cover-Bild URL</Label>
                        <Input
                          id="coverImage"
                          value={newManga.coverImage}
                          onChange={(e) => setNewManga({ ...newManga, coverImage: e.target.value })}
                          placeholder="URL zum Cover-Bild"
                          className="border-purple-200 focus:border-purple-400"
                          disabled={loading}
                        />
                        {newManga.coverImage && newManga.coverImage !== "/placeholder.svg?height=120&width=80" && (
                          <div className="mt-2 flex justify-center">
                            <img
                              src={newManga.coverImage || "/placeholder.svg"}
                              alt="Cover Vorschau"
                              className="h-40 object-contain rounded-md border border-purple-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=120&width=80"
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="read"
                            checked={newManga.read}
                            onCheckedChange={(checked) => setNewManga({ ...newManga, read: checked as boolean })}
                            disabled={loading}
                          />
                          <Label htmlFor="read">Gelesen ⭐</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="double"
                            checked={newManga.double}
                            onCheckedChange={(checked) => setNewManga({ ...newManga, double: checked as boolean })}
                            disabled={loading}
                          />
                          <Label htmlFor="double">Doppelt vorhanden 📚</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="newbuy"
                            checked={newManga.newbuy}
                            onCheckedChange={(checked) => setNewManga({ ...newManga, newbuy: checked as boolean })}
                            disabled={loading}
                          />
                          <Label htmlFor="newbuy">Neu kaufen 🛒</Label>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddManga}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Manga hinzufügen ✨
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedMangas.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 w-full"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {selectedMangas.length} Manga löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Manga löschen</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchtest du wirklich {selectedMangas.length} Manga löschen? Diese Aktion kann nicht rückgängig
                        gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="border-purple-200 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-700 flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filter & Sortierung
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-purple-600"
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Zurücksetzen
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select
                        value={filters.genre}
                        onValueChange={(value) => {
                          setFilters({ ...filters, genre: value })
                          updateURL({ ...filters, genre: value }, searchTerm, sortConfig, 1)
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="Alle Genres" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Genres</SelectItem>
                          {filterOptions.genres.map((genre) => (
                            <SelectItem key={genre} value={genre}>
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Autor</Label>
                      <Select
                        value={filters.autor}
                        onValueChange={(value) => {
                          setFilters({ ...filters, autor: value })
                          updateURL({ ...filters, autor: value }, searchTerm, sortConfig, 1)
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="Alle Autoren" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Autoren</SelectItem>
                          {filterOptions.autors.map((autor) => (
                            <SelectItem key={autor} value={autor}>
                              {autor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Verlag</Label>
                      <Select
                        value={filters.verlag}
                        onValueChange={(value) => {
                          setFilters({ ...filters, verlag: value })
                          updateURL({ ...filters, verlag: value }, searchTerm, sortConfig, 1)
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="Alle Verlage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Verlage</SelectItem>
                          {filterOptions.verlags.map((verlag) => (
                            <SelectItem key={verlag} value={verlag}>
                              {verlag}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Sprache</Label>
                      <Select
                        value={filters.sprache}
                        onValueChange={(value) => {
                          setFilters({ ...filters, sprache: value })
                          updateURL({ ...filters, sprache: value }, searchTerm, sortConfig, 1)
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="Alle Sprachen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Sprachen</SelectItem>
                          {filterOptions.sprachen.map((sprache) => (
                            <SelectItem key={sprache} value={sprache}>
                              {sprache}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Band</Label>
                      <Select
                        value={filters.band}
                        onValueChange={(value) => {
                          setFilters({ ...filters, band: value })
                          updateURL({ ...filters, band: value }, searchTerm, sortConfig, 1)
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="Alle Bände" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Bände</SelectItem>
                          {filterOptions.bands.map((band) => (
                            <SelectItem key={band} value={band}>
                              Band {band}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => {
                          setFilters({ ...filters, status: value })
                          updateURL({ ...filters, status: value }, searchTerm, sortConfig, 1)
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className="border-purple-200">
                          <SelectValue placeholder="Alle Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Alle Status</SelectItem>
                          <SelectItem value="read">Gelesen ⭐</SelectItem>
                          <SelectItem value="unread">Ungelesen 📖</SelectItem>
                          <SelectItem value="double">Doppelt 📚</SelectItem>
                          <SelectItem value="newbuy">Neu kaufen 🛒</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-100">
                      <span className="text-sm text-muted-foreground">Aktive Filter:</span>
                      {searchTerm && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Suche: "{searchTerm}"
                        </Badge>
                      )}
                      {Object.entries(filters).map(([key, value]) => {
                        if (!value) return null
                        return (
                          <Badge key={key} variant="secondary" className="bg-purple-100 text-purple-700">
                            {key}: {value}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Manga Table */}
        <Card className="shadow-xl border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center justify-between text-purple-700">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Manga-Sammlung ({mangas.length})
              </span>
              {mangas.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedMangas.length === mangas.length}
                    onCheckedChange={handleSelectAll}
                    disabled={loading}
                  />
                  <span className="text-sm text-muted-foreground">Alle auswählen</span>
                </div>
              )}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-purple-100" disabled={loading}>
                  Sortieren
                  {sortConfig.key ? ` (${getSortIndicator(sortConfig.key)})` : ""}
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("titel")}>
                  Titel {getSortIndicator("titel")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("autor")}>
                  Autor {getSortIndicator("autor")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("band")}>Band {getSortIndicator("band")} </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("genre")}>
                  Genre {getSortIndicator("genre")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("verlag")}>
                  Verlag {getSortIndicator("verlag")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("sprache")}>
                  Sprache {getSortIndicator("sprache")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6">
                  <LoadingSkeleton />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-50">
                      <TableHead className="w-12">
                        <span className="sr-only">Auswahl</span>
                      </TableHead>
                      <TableHead>Cover</TableHead>
                      <TableHead className="font-semibold text-purple-700">Titel</TableHead>
                      <TableHead className="font-semibold text-purple-700">Band</TableHead>
                      <TableHead className="font-semibold text-purple-700">Genre</TableHead>
                      <TableHead className="font-semibold text-purple-700">Autor</TableHead>
                      <TableHead className="font-semibold text-purple-700">Verlag</TableHead>
                      <TableHead className="font-semibold text-purple-700">ISBN</TableHead>
                      <TableHead className="font-semibold text-purple-700">Sprache</TableHead>
                      <TableHead className="font-semibold text-purple-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mangas.map((manga, index) => (
                      <TableRow key={manga.id} className={index % 2 === 0 ? "bg-white" : "bg-purple-25"}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMangas.includes(manga.id)}
                            onCheckedChange={() => handleSelectManga(manga.id)}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="w-12 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                            {manga.coverImage ? (
                              <img
                                src={manga.coverImage || "/placeholder.svg"}
                                alt={`Cover von ${manga.titel}`}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  target.nextElementSibling?.classList.remove("hidden")
                                }}
                              />
                            ) : null}
                            <BookOpen className="h-6 w-6 text-purple-400" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-purple-900">
                          <Link
                            href={`/manga?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), id: manga.id }).toString()}`}
                            className="hover:underline"
                          >
                            {manga.titel}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {manga.band ? (
                            <Badge
                              variant="outline"
                              className="bg-purple-50 border-purple-300 text-purple-700 font-medium px-2.5 py-1"
                            >
                              Band {manga.band}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground italic">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {manga.genre ? (
                              manga.genre.split(",").map((g, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 shadow-sm"
                                >
                                  {g.trim()}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground italic">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {manga.autor || <span className="text-muted-foreground italic">Nicht angegeben</span>}
                        </TableCell>
                        <TableCell>
                          {manga.verlag || <span className="text-muted-foreground italic">Nicht angegeben</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{manga.isbn}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            {manga.sprache}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              {manga.read ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <span className="text-sm text-green-700 font-medium">Gelesen</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                  <span className="text-sm text-gray-500">Ungelesen</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {manga.double ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                  <span className="text-sm text-orange-700 font-medium">Doppelt</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                  <span className="text-sm text-gray-500">Einzeln</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {manga.newbuy ? (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                  <span className="text-sm text-purple-700 font-medium">Kaufen</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                  <span className="text-sm text-gray-500">Neu kaufen</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {!loading && mangas.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-purple-300" />
                <p className="text-lg">Keine Manga gefunden 📚</p>
                {searchTerm || activeFiltersCount > 0 ? (
                  <p className="text-sm">Versuche andere Filter oder Suchbegriffe.</p>
                ) : (
                  <p className="text-sm">Füge dein erstes Manga hinzu! ✨</p>
                )}
              </div>
            )}
          </CardContent>

          {/* Enhanced Pagination */}
          {!loading && mangas.length > 0 && totalPages > 1 && (
            <EnhancedPagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={pageSize}
              onPageChange={handlePageChange}
              loading={loading}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default function MangaCollection() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
          <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      }
    >
      <MangaCollectionContent />
    </Suspense>
  )
}
