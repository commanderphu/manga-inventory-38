import { type NextRequest, NextResponse } from "next/server"

// GET /api/manga/isbn?isbn=9783551791429
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isbn = searchParams.get("isbn")

    if (!isbn) {
      return NextResponse.json({ error: "ISBN is required" }, { status: 400 })
    }

    // First try Google Books API
    const googleBooksResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    const googleData = await googleBooksResponse.json()

    if (googleData.totalItems > 0) {
      const book = googleData.items[0].volumeInfo

      // Extract relevant data
      const mangaData = {
        titel: book.title || "",
        autor: book.authors ? book.authors.join(", ") : "",
        verlag: book.publisher || "",
        isbn: isbn,
        genre: book.categories ? book.categories.join(", ") : "",
        sprache: book.language || "de",
        coverImage: book.imageLinks?.thumbnail || "",
        description: book.description || "",
      }

      return NextResponse.json({
        data: mangaData,
        message: "Metadata retrieved successfully",
      })
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
        sprache: book.language || "de",
        coverImage: book.cover?.medium || "",
        description: book.excerpts ? book.excerpts[0].text : "",
      }

      return NextResponse.json({
        data: mangaData,
        message: "Metadata retrieved successfully",
      })
    }

    // No data found
    return NextResponse.json(
      {
        error: "No metadata found for this ISBN",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("GET /api/manga/isbn error:", error)
    return NextResponse.json({ error: "Failed to retrieve metadata" }, { status: 500 })
  }
}
