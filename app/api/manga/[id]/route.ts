import { type NextRequest, NextResponse } from "next/server"
import type { Manga, UpdateMangaRequest } from "@/lib/api"

// This would be imported from a shared data store in a real app
// For now, we'll simulate it
const mangas: Manga[] = []

// GET /api/manga/[id] - Get single manga
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const manga = mangas.find((m) => m.id === params.id)

    if (!manga) {
      return NextResponse.json({ error: "Manga not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: manga,
      message: "Manga retrieved successfully",
    })
  } catch (error) {
    console.error("GET /api/manga/[id] error:", error)
    return NextResponse.json({ error: "Failed to retrieve manga" }, { status: 500 })
  }
}

// PUT /api/manga/[id] - Update manga
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body: UpdateMangaRequest = await request.json()

    const mangaIndex = mangas.findIndex((m) => m.id === params.id)

    if (mangaIndex === -1) {
      return NextResponse.json({ error: "Manga not found" }, { status: 404 })
    }

    const updatedManga: Manga = {
      ...mangas[mangaIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    mangas[mangaIndex] = updatedManga

    return NextResponse.json({
      data: updatedManga,
      message: "Manga updated successfully",
    })
  } catch (error) {
    console.error("PUT /api/manga/[id] error:", error)
    return NextResponse.json({ error: "Failed to update manga" }, { status: 500 })
  }
}

// DELETE /api/manga/[id] - Delete manga
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const mangaIndex = mangas.findIndex((m) => m.id === params.id)

    if (mangaIndex === -1) {
      return NextResponse.json({ error: "Manga not found" }, { status: 404 })
    }

    mangas.splice(mangaIndex, 1)

    return NextResponse.json({
      data: null,
      message: "Manga deleted successfully",
    })
  } catch (error) {
    console.error("DELETE /api/manga/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete manga" }, { status: 500 })
  }
}
