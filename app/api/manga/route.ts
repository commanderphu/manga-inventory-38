import { type NextRequest, NextResponse } from "next/server"
import type { Manga, CreateMangaRequest } from "@/lib/api"

// In-memory storage (replace with database in production)
const mangas: Manga[] = [
  {
    id: "1",
    titel: "One Piece",
    band: "1",
    genre: "Shonen, Abenteuer",
    autor: "Eiichiro Oda",
    verlag: "Carlsen",
    isbn: "978-3-551-75271-4",
    sprache: "Deutsch",
    coverImage: "/placeholder.svg?height=120&width=80",
    read: true,
    double: false,
    newbuy: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    titel: "Attack on Titan",
    band: "5",
    genre: "Action, Drama",
    autor: "Hajime Isayama",
    verlag: "Carlsen",
    isbn: "978-3-551-75275-2",
    sprache: "Deutsch",
    coverImage: "/placeholder.svg?height=120&width=80",
    read: false,
    double: true,
    newbuy: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    titel: "Demon Slayer",
    band: "3",
    genre: "Shonen, Supernatural",
    autor: "Koyoharu Gotouge",
    verlag: "Panini",
    isbn: "978-3-741-61234-5",
    sprache: "Deutsch",
    coverImage: "/placeholder.svg?height=120&width=80",
    read: true,
    double: false,
    newbuy: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    titel: "Naruto",
    band: "1",
    genre: "Shonen, Ninja",
    autor: "Masashi Kishimoto",
    verlag: "Carlsen",
    isbn: "978-3-551-75280-6",
    sprache: "Deutsch",
    coverImage: "/placeholder.svg?height=120&width=80",
    read: true,
    double: false,
    newbuy: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    titel: "My Hero Academia",
    band: "2",
    genre: "Shonen, Superhero",
    autor: "Kohei Horikoshi",
    verlag: "Panini",
    isbn: "978-3-741-61235-2",
    sprache: "Englisch",
    coverImage: "/placeholder.svg?height=120&width=80",
    read: false,
    double: false,
    newbuy: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Helper function to filter mangas
function filterMangas(mangas: Manga[], params: URLSearchParams) {
  let filtered = [...mangas]

  const search = params.get("search")
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(
      (manga) =>
        manga.titel.toLowerCase().includes(searchLower) ||
        manga.autor.toLowerCase().includes(searchLower) ||
        manga.genre.toLowerCase().includes(searchLower),
    )
  }

  const genre = params.get("genre")
  if (genre) {
    filtered = filtered.filter((manga) => manga.genre.toLowerCase().includes(genre.toLowerCase()))
  }

  const autor = params.get("autor")
  if (autor) {
    filtered = filtered.filter((manga) => manga.autor === autor)
  }

  const verlag = params.get("verlag")
  if (verlag) {
    filtered = filtered.filter((manga) => manga.verlag === verlag)
  }

  const sprache = params.get("sprache")
  if (sprache) {
    filtered = filtered.filter((manga) => manga.sprache === sprache)
  }

  const band = params.get("band")
  if (band) {
    filtered = filtered.filter((manga) => manga.band === band)
  }

  const status = params.get("status")
  if (status) {
    switch (status) {
      case "read":
        filtered = filtered.filter((manga) => manga.read)
        break
      case "unread":
        filtered = filtered.filter((manga) => !manga.read)
        break
      case "double":
        filtered = filtered.filter((manga) => manga.double)
        break
      case "newbuy":
        filtered = filtered.filter((manga) => manga.newbuy)
        break
    }
  }

  return filtered
}

// GET /api/manga - Get all manga with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Apply filters
    const filtered = filterMangas(mangas, searchParams)

    // Pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const paginatedData = filtered.slice(startIndex, endIndex)

    return NextResponse.json({
      data: {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
      message: "Manga retrieved successfully",
    })
  } catch (error) {
    console.error("GET /api/manga error:", error)
    return NextResponse.json({ error: "Failed to retrieve manga" }, { status: 500 })
  }
}

// POST /api/manga - Create new manga
export async function POST(request: NextRequest) {
  try {
    const body: CreateMangaRequest = await request.json()

    // Validation
    if (!body.titel) {
      return NextResponse.json({ error: "Titel is required" }, { status: 400 })
    }

    const newManga: Manga = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mangas.push(newManga)

    return NextResponse.json(
      {
        data: newManga,
        message: "Manga created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST /api/manga error:", error)
    return NextResponse.json({ error: "Failed to create manga" }, { status: 500 })
  }
}
