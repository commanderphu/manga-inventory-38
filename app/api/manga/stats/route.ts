import { type NextRequest, NextResponse } from "next/server"
import type { Manga } from "@/lib/api"

// This would be imported from a shared data store in a real app
const mangas: Manga[] = []

// GET /api/manga/stats - Get manga statistics
export async function GET(request: NextRequest) {
  try {
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
      const genres = manga.genre.split(",").map((g) => g.trim())
      genres.forEach((genre) => {
        if (genre) {
          stats.byGenre[genre] = (stats.byGenre[genre] || 0) + 1
        }
      })
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

    return NextResponse.json({
      data: stats,
      message: "Statistics retrieved successfully",
    })
  } catch (error) {
    console.error("GET /api/manga/stats error:", error)
    return NextResponse.json({ error: "Failed to retrieve statistics" }, { status: 500 })
  }
}
