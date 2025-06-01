import { supabase } from "./supabase"

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

// Helper function to transform database row to Manga interface
function transformMangaFromDB(row: any): Manga {
  return {
    id: row.id,
    titel: row.titel || "",
    band: row.band || "",
    genre: row.genre || "",
    autor: row.autor || "",
    verlag: row.verlag || "",
    isbn: row.isbn || "",
    sprache: row.sprache || "Deutsch",
    coverImage: row.cover_image || "/placeholder.svg?height=120&width=80",
    read: row.read || false,
    double: row.double || false,
    newbuy: row.newbuy || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Helper function to transform Manga interface to database row
function transformMangaToDB(manga: CreateMangaRequest | UpdateMangaRequest) {
  return {
    titel: manga.titel,
    band: manga.band,
    genre: manga.genre,
    autor: manga.autor,
    verlag: manga.verlag,
    isbn: manga.isbn,
    sprache: manga.sprache,
    cover_image: manga.coverImage,
    read: manga.read,
    double: manga.double,
    newbuy: manga.newbuy,
  }
}

// API Client Class
class MangaAPI {
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
    try {
      const page = params?.page || 1
      const limit = params?.limit || 50
      const offset = (page - 1) * limit

      let query = supabase.from("manga").select("*", { count: "exact" })

      // Apply search filter
      if (params?.search) {
        query = query.or(`titel.ilike.%${params.search}%,autor.ilike.%${params.search}%,genre.ilike.%${params.search}%`)
      }

      // Apply filters
      if (params?.genre) {
        query = query.ilike("genre", `%${params.genre}%`)
      }

      if (params?.autor) {
        query = query.eq("autor", params.autor)
      }

      if (params?.verlag) {
        query = query.eq("verlag", params.verlag)
      }

      if (params?.sprache) {
        query = query.eq("sprache", params.sprache)
      }

      if (params?.band) {
        query = query.eq("band", params.band)
      }

      // Apply status filters
      if (params?.status) {
        switch (params.status) {
          case "read":
            query = query.eq("read", true)
            break
          case "unread":
            query = query.eq("read", false)
            break
          case "double":
            query = query.eq("double", true)
            break
          case "newbuy":
            query = query.eq("newbuy", true)
            break
        }
      }

      // Apply pagination and ordering
      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) {
        throw new Error(error.message)
      }

      const transformedData = data?.map(transformMangaFromDB) || []
      const total = count || 0
      const totalPages = Math.ceil(total / limit)

      return {
        data: {
          data: transformedData,
          total,
          page,
          limit,
          totalPages,
        },
        message: "Manga retrieved successfully",
      }
    } catch (error) {
      console.error("Error fetching manga:", error)
      throw error
    }
  }

  // GET single manga by ID
  async getManga(id: string): Promise<ApiResponse<Manga>> {
    try {
      const { data, error } = await supabase.from("manga").select("*").eq("id", id).single()

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error("Manga not found")
      }

      return {
        data: transformMangaFromDB(data),
        message: "Manga retrieved successfully",
      }
    } catch (error) {
      console.error("Error fetching manga:", error)
      throw error
    }
  }

  // POST create new manga
  async createManga(manga: CreateMangaRequest): Promise<ApiResponse<Manga>> {
    try {
      const dbManga = transformMangaToDB(manga)

      const { data, error } = await supabase.from("manga").insert([dbManga]).select().single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: transformMangaFromDB(data),
        message: "Manga created successfully",
      }
    } catch (error) {
      console.error("Error creating manga:", error)
      throw error
    }
  }

  // PUT update manga
  async updateManga(id: string, manga: UpdateMangaRequest): Promise<ApiResponse<Manga>> {
    try {
      const dbManga = transformMangaToDB(manga)

      const { data, error } = await supabase.from("manga").update(dbManga).eq("id", id).select().single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: transformMangaFromDB(data),
        message: "Manga updated successfully",
      }
    } catch (error) {
      console.error("Error updating manga:", error)
      throw error
    }
  }

  // DELETE manga
  async deleteManga(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from("manga").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: undefined,
        message: "Manga deleted successfully",
      }
    } catch (error) {
      console.error("Error deleting manga:", error)
      throw error
    }
  }

  // DELETE multiple manga
  async deleteMangas(ids: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from("manga").delete().in("id", ids)

      if (error) {
        throw new Error(error.message)
      }

      return {
        data: undefined,
        message: `${ids.length} manga deleted successfully`,
      }
    } catch (error) {
      console.error("Error deleting manga:", error)
      throw error
    }
  }

  // POST import manga from Excel
  async importMangas(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    try {
      // Import XLSX dynamically to avoid SSR issues
      const XLSX = await import("xlsx")

      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const importedMangas: any[] = []
      const errors: string[] = []

      for (let i = 0; i < jsonData.length; i++) {
        const row: any = jsonData[i]
        try {
          const manga = {
            titel: row.title || row.Title || "",
            band: row.band || row.Band || "",
            genre: row.genre || row.Genre || "",
            autor: row.autor || row.Autor || "",
            verlag: row.verlag || row.Verlag || "",
            isbn: row.isbn || row.ISBN || "",
            sprache: row.sprache || row.Sprache || "Deutsch",
            cover_image: "/placeholder.svg?height=120&width=80",
            read: Boolean(row.read || row.Read),
            double: Boolean(row.double || row.Double),
            newbuy: Boolean(row.new_buy || row.New_Buy || row.newbuy),
          }

          if (!manga.titel) {
            errors.push(`Row ${i + 2}: Title is required`)
            continue
          }

          importedMangas.push(manga)
        } catch (error) {
          errors.push(`Row ${i + 2}: ${error}`)
        }
      }

      // Bulk insert into Supabase
      if (importedMangas.length > 0) {
        const { error } = await supabase.from("manga").insert(importedMangas)

        if (error) {
          throw new Error(error.message)
        }
      }

      return {
        data: {
          imported: importedMangas.length,
          errors,
        },
        message: `Successfully imported ${importedMangas.length} manga`,
      }
    } catch (error) {
      console.error("Error importing manga:", error)
      throw error
    }
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
    try {
      // Get all manga for statistics
      const { data: allManga, error } = await supabase.from("manga").select("*")

      if (error) {
        throw new Error(error.message)
      }

      const mangas = allManga || []

      const stats = {
        total: mangas.length,
        read: mangas.filter((m) => m.read).length,
        doubles: mangas.filter((m) => m.double).length,
        newbuys: mangas.filter((m) => m.newbuy).length,
        byGenre: {} as Record<string, number>,
        byAutor: {} as Record<string, number>,
        byVerlag: {} as Record<string, number>,
      }

      // Count by genre
      mangas.forEach((manga) => {
        if (manga.genre) {
          const genres = manga.genre.split(",").map((g: string) => g.trim())
          genres.forEach((genre) => {
            if (genre) {
              stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1
            }
          })
        }
      })

      // Count by author
      mangas.forEach((manga) => {
        if (manga.autor) {
          stats.byAutor[manga.autor] = (stats.byAutor[manga.autor] || 0) + 1
        }
      })

      // Count by publisher
      mangas.forEach((manga) => {
        if (manga.verlag) {
          stats.byVerlag[manga.verlag] = (stats.byVerlag[manga.verlag] || 0) + 1
        }
      })

      return {
        data: stats,
        message: "Statistics retrieved successfully",
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      throw error
    }
  }

  // GET metadata for ISBN
  async getISBNMetadata(isbn: string): Promise<ApiResponse<Partial<Manga>>> {
    try {
      // First try Google Books API
      const googleBooksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      const googleData = await googleBooksResponse.json()

      if (googleData.totalItems > 0) {
        const book = googleData.items[0].volumeInfo

        const mangaData = {
          titel: book.title || "",
          autor: book.authors ? book.authors.join(", ") : "",
          verlag: book.publisher || "",
          isbn: isbn,
          genre: book.categories ? book.categories.join(", ") : "",
          sprache: book.language === "de" ? "Deutsch" : book.language || "Deutsch",
          coverImage: book.imageLinks?.thumbnail || "",
        }

        return {
          data: mangaData,
          message: "Metadata retrieved successfully",
        }
      }

      // If Google Books fails, try Open Library as fallback
      const openLibraryResponse = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      )
      const openLibraryData = await openLibraryResponse.json()

      if (openLibraryData[`ISBN:${isbn}`]) {
        const book = openLibraryData[`ISBN:${isbn}`]

        const mangaData = {
          titel: book.title || "",
          autor: book.authors ? book.authors.map((a: any) => a.name).join(", ") : "",
          verlag: book.publishers ? book.publishers[0].name : "",
          isbn: isbn,
          genre: "",
          sprache: "Deutsch",
          coverImage: book.cover?.medium || "",
        }

        return {
          data: mangaData,
          message: "Metadata retrieved successfully",
        }
      }

      // No data found
      throw new Error("No metadata found for this ISBN")
    } catch (error) {
      console.error("Error fetching ISBN metadata:", error)
      throw error
    }
  }
}

export const mangaAPI = new MangaAPI()
