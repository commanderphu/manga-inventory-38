import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import type { Manga } from "@/lib/api"

// This would be imported from a shared data store in a real app
const mangas: Manga[] = []

// POST /api/manga/import - Import manga from Excel file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an Excel file." }, { status: 400 })
    }

    // Read file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    const importedMangas: Manga[] = []
    const errors: string[] = []

    jsonData.forEach((row: any, index: number) => {
      try {
        const manga: Manga = {
          id: `import_${Date.now()}_${index}`,
          titel: row.title || row.Title || "",
          band: row.band || row.Band || "",
          genre: row.genre || row.Genre || "",
          autor: "", // Will be filled later
          verlag: "", // Will be filled later
          isbn: row.isbn || row.ISBN || "",
          sprache: "Deutsch", // Default language
          coverImage: "/placeholder.svg?height=120&width=80",
          read: Boolean(row.read || row.Read),
          double: Boolean(row.double || row.Double),
          newbuy: Boolean(row.new_buy || row.New_Buy || row.newbuy),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        if (!manga.titel) {
          errors.push(`Row ${index + 2}: Title is required`)
          return
        }

        importedMangas.push(manga)
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error}`)
      }
    })

    // Add imported manga to the collection
    mangas.push(...importedMangas)

    return NextResponse.json({
      data: {
        imported: importedMangas.length,
        errors,
      },
      message: `Successfully imported ${importedMangas.length} manga`,
    })
  } catch (error) {
    console.error("POST /api/manga/import error:", error)
    return NextResponse.json({ error: "Failed to import manga" }, { status: 500 })
  }
}
