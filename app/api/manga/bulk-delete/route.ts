import { type NextRequest, NextResponse } from "next/server"

// This would be imported from a shared data store in a real app
let mangas: any[] = []

// DELETE /api/manga/bulk-delete - Delete multiple manga
export async function DELETE(request: NextRequest) {
  try {
    const { ids }: { ids: string[] } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty ids array" }, { status: 400 })
    }

    const initialLength = mangas.length
    mangas = mangas.filter((manga) => !ids.includes(manga.id))
    const deletedCount = initialLength - mangas.length

    return NextResponse.json({
      data: null,
      message: `${deletedCount} manga deleted successfully`,
    })
  } catch (error) {
    console.error("DELETE /api/manga/bulk-delete error:", error)
    return NextResponse.json({ error: "Failed to delete manga" }, { status: 500 })
  }
}
