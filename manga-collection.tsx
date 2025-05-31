"use client"

import type React from "react"

import { useState, useRef, useMemo } from "react"
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
  ImageIcon,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  X,
  Star,
  Heart,
  Sparkles,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import * as XLSX from "xlsx"

interface Manga {
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
}

interface Filters {
  genre: string
  autor: string
  verlag: string
  sprache: string
  status: string
  band: string
}

export default function MangaCollection() {
  const [mangas, setMangas] = useState<Manga[]>([
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
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingManga, setEditingManga] = useState<Manga | null>(null)
  const [selectedMangas, setSelectedMangas] = useState<string[]>([])
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState<Filters>({
    genre: "",
    autor: "",
    verlag: "",
    sprache: "",
    status: "",
    band: "",
  })

  const [newManga, setNewManga] = useState<Omit<Manga, "id">>({
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

  // Apply filters
  const filteredMangas = useMemo(() => {
    return mangas.filter((manga) => {
      // Search term filter
      const matchesSearch =
        manga.titel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manga.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manga.genre.toLowerCase().includes(searchTerm.toLowerCase())

      // Genre filter
      const matchesGenre = !filters.genre || manga.genre.toLowerCase().includes(filters.genre.toLowerCase())

      // Author filter
      const matchesAutor = !filters.autor || manga.autor === filters.autor

      // Publisher filter
      const matchesVerlag = !filters.verlag || manga.verlag === filters.verlag

      // Language filter
      const matchesSprache = !filters.sprache || manga.sprache === filters.sprache

      // Band filter
      const matchesBand = !filters.band || manga.band === filters.band

      // Status filter
      const matchesStatus = (() => {
        if (!filters.status) return true
        switch (filters.status) {
          case "read":
            return manga.read
          case "unread":
            return !manga.read
          case "double":
            return manga.double
          case "newbuy":
            return manga.newbuy
          default:
            return true
        }
      })()

      return (
        matchesSearch && matchesGenre && matchesAutor && matchesVerlag && matchesSprache && matchesBand && matchesStatus
      )
    })
  }, [mangas, searchTerm, filters])

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      genre: "",
      autor: "",
      verlag: "",
      sprache: "",
      status: "",
      band: "",
    })
    setSearchTerm("")
  }

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0)

  // ADD Function
  const handleAddManga = () => {
    if (newManga.titel) {
      const manga: Manga = {
        ...newManga,
        id: Date.now().toString(),
      }
      setMangas([...mangas, manga])
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
    }
  }

  // UPDATE Function
  const handleEditManga = (manga: Manga) => {
    setEditingManga(manga)
    setIsEditDialogOpen(true)
  }

  const handleUpdateManga = () => {
    if (editingManga && editingManga.titel) {
      setMangas(mangas.map((manga) => (manga.id === editingManga.id ? editingManga : manga)))
      setEditingManga(null)
      setIsEditDialogOpen(false)
      setImportStatus({
        type: "success",
        message: "Manga erfolgreich aktualisiert! 🎉",
      })
    }
  }

  // DELETE Functions
  const handleDeleteManga = (id: string) => {
    setMangas(mangas.filter((manga) => manga.id !== id))
    setImportStatus({
      type: "success",
      message: "Manga erfolgreich gelöscht! 🗑️",
    })
  }

  const handleBulkDelete = () => {
    setMangas(mangas.filter((manga) => !selectedMangas.includes(manga.id)))
    setSelectedMangas([])
    setImportStatus({
      type: "success",
      message: `${selectedMangas.length} Manga erfolgreich gelöscht! 💥`,
    })
  }

  // Selection Functions
  const handleSelectManga = (id: string) => {
    setSelectedMangas((prev) => (prev.includes(id) ? prev.filter((mangaId) => mangaId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedMangas.length === filteredMangas.length) {
      setSelectedMangas([])
    } else {
      setSelectedMangas(filteredMangas.map((manga) => manga.id))
    }
  }

  const handleExcelImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const importedMangas: Manga[] = jsonData.map((row: any, index: number) => ({
          id: `import_${Date.now()}_${index}`,
          titel: row.title || row.Title || "",
          band: row.band || row.Band || "",
          genre: row.genre || row.Genre || "",
          autor: "",
          verlag: "",
          isbn: row.isbn || row.ISBN || "",
          sprache: "Deutsch",
          coverImage: "/placeholder.svg?height=120&width=80",
          read: Boolean(row.read || row.Read),
          double: Boolean(row.double || row.Double),
          newbuy: Boolean(row.new_buy || row.New_Buy || row.newbuy),
        }))

        setMangas((prevMangas) => [...prevMangas, ...importedMangas])
        setImportStatus({
          type: "success",
          message: `${importedMangas.length} Manga erfolgreich importiert! 🚀`,
        })
        setIsImportDialogOpen(false)

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
    reader.readAsArrayBuffer(file)
  }

  const toggleCheckbox = (id: string, field: "read" | "double" | "newbuy") => {
    setMangas(mangas.map((manga) => (manga.id === id ? { ...manga, [field]: !manga[field] } : manga)))
  }

  const stats = {
    total: mangas.length,
    read: mangas.filter((m) => m.read).length,
    doubles: mangas.filter((m) => m.double).length,
    newbuys: mangas.filter((m) => m.newbuy).length,
  }

  // Clear status after 3 seconds
  useState(() => {
    if (importStatus.type) {
      const timer = setTimeout(() => {
        setImportStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  })

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
                    <p className="text-2xl font-bold">{stats.total}</p>
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
                    <p className="text-2xl font-bold">{stats.read}</p>
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
                    <p className="text-2xl font-bold">{stats.doubles}</p>
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
                    <p className="text-2xl font-bold">{stats.newbuys}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Titel, Autor oder Genre... 🔍"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-purple-200 focus:border-purple-400 shadow-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter {activeFiltersCount > 0 && <Badge className="ml-2 bg-purple-500">{activeFiltersCount}</Badge>}
                </Button>

                {selectedMangas.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {selectedMangas.length} löschen
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
                          Löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-blue-200 hover:bg-blue-50">
                      <Upload className="h-4 w-4 mr-2" />
                      Excel Import
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
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Manga hinzufügen
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
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={newManga.isbn}
                          onChange={(e) => setNewManga({ ...newManga, isbn: e.target.value })}
                          placeholder="ISBN-Nummer"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coverImage">Cover-Bild URL</Label>
                        <Input
                          id="coverImage"
                          value={newManga.coverImage}
                          onChange={(e) => setNewManga({ ...newManga, coverImage: e.target.value })}
                          placeholder="URL zum Cover-Bild"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="read"
                            checked={newManga.read}
                            onCheckedChange={(checked) => setNewManga({ ...newManga, read: checked as boolean })}
                          />
                          <Label htmlFor="read">Gelesen ⭐</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="double"
                            checked={newManga.double}
                            onCheckedChange={(checked) => setNewManga({ ...newManga, double: checked as boolean })}
                          />
                          <Label htmlFor="double">Doppelt vorhanden 📚</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="newbuy"
                            checked={newManga.newbuy}
                            onCheckedChange={(checked) => setNewManga({ ...newManga, newbuy: checked as boolean })}
                          />
                          <Label htmlFor="newbuy">Neu kaufen 🛒</Label>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddManga}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      >
                        Manga hinzufügen ✨
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
                      <Button variant="outline" size="sm" onClick={clearFilters} className="text-purple-600">
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
                      <Select value={filters.genre} onValueChange={(value) => setFilters({ ...filters, genre: value })}>
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
                      <Select value={filters.autor} onValueChange={(value) => setFilters({ ...filters, autor: value })}>
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
                        onValueChange={(value) => setFilters({ ...filters, verlag: value })}
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
                        onValueChange={(value) => setFilters({ ...filters, sprache: value })}
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
                      <Select value={filters.band} onValueChange={(value) => setFilters({ ...filters, band: value })}>
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
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-700">Manga bearbeiten ✏️</DialogTitle>
            </DialogHeader>
            {editingManga && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-titel">Titel *</Label>
                  <Input
                    id="edit-titel"
                    value={editingManga.titel}
                    onChange={(e) => setEditingManga({ ...editingManga, titel: e.target.value })}
                    placeholder="Manga-Titel"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-band">Band</Label>
                    <Input
                      id="edit-band"
                      value={editingManga.band}
                      onChange={(e) => setEditingManga({ ...editingManga, band: e.target.value })}
                      placeholder="Band-Nr."
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-sprache">Sprache</Label>
                    <Input
                      id="edit-sprache"
                      value={editingManga.sprache}
                      onChange={(e) => setEditingManga({ ...editingManga, sprache: e.target.value })}
                      placeholder="Deutsch"
                      className="border-purple-200 focus:border-purple-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-genre">Genre</Label>
                  <Input
                    id="edit-genre"
                    value={editingManga.genre}
                    onChange={(e) => setEditingManga({ ...editingManga, genre: e.target.value })}
                    placeholder="z.B. Shonen, Action"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-autor">Autor</Label>
                  <Input
                    id="edit-autor"
                    value={editingManga.autor}
                    onChange={(e) => setEditingManga({ ...editingManga, autor: e.target.value })}
                    placeholder="Autor-Name"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-verlag">Verlag</Label>
                  <Input
                    id="edit-verlag"
                    value={editingManga.verlag}
                    onChange={(e) => setEditingManga({ ...editingManga, verlag: e.target.value })}
                    placeholder="Verlag"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-isbn">ISBN</Label>
                  <Input
                    id="edit-isbn"
                    value={editingManga.isbn}
                    onChange={(e) => setEditingManga({ ...editingManga, isbn: e.target.value })}
                    placeholder="ISBN-Nummer"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-coverImage">Cover-Bild URL</Label>
                  <Input
                    id="edit-coverImage"
                    value={editingManga.coverImage}
                    onChange={(e) => setEditingManga({ ...editingManga, coverImage: e.target.value })}
                    placeholder="URL zum Cover-Bild"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-read"
                      checked={editingManga.read}
                      onCheckedChange={(checked) => setEditingManga({ ...editingManga, read: checked as boolean })}
                    />
                    <Label htmlFor="edit-read">Gelesen ⭐</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-double"
                      checked={editingManga.double}
                      onCheckedChange={(checked) => setEditingManga({ ...editingManga, double: checked as boolean })}
                    />
                    <Label htmlFor="edit-double">Doppelt vorhanden 📚</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-newbuy"
                      checked={editingManga.newbuy}
                      onCheckedChange={(checked) => setEditingManga({ ...editingManga, newbuy: checked as boolean })}
                    />
                    <Label htmlFor="edit-newbuy">Neu kaufen 🛒</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdateManga}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    Aktualisieren ✨
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manga Table */}
        <Card className="shadow-xl border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center justify-between text-purple-700">
              <span className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Manga-Sammlung ({filteredMangas.length})
              </span>
              {filteredMangas.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedMangas.length === filteredMangas.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Alle auswählen</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                    <TableHead className="w-20 font-semibold text-purple-700">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMangas.map((manga, index) => (
                    <TableRow key={manga.id} className={index % 2 === 0 ? "bg-white" : "bg-purple-25"}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMangas.includes(manga.id)}
                          onCheckedChange={() => handleSelectManga(manga.id)}
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
                          <ImageIcon className="h-6 w-6 text-purple-400" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-purple-900">{manga.titel}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          Band {manga.band}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {manga.genre.split(",").map((g, i) => (
                            <Badge key={i} variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                              {g.trim()}
                            </Badge>
                          ))}
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
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox checked={manga.read} onCheckedChange={() => toggleCheckbox(manga.id, "read")} />
                            <span className="text-sm">Gelesen ⭐</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={manga.double}
                              onCheckedChange={() => toggleCheckbox(manga.id, "double")}
                            />
                            <span className="text-sm">Doppelt 📚</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={manga.newbuy}
                              onCheckedChange={() => toggleCheckbox(manga.id, "newbuy")}
                            />
                            <span className="text-sm">Neu kaufen 🛒</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-purple-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditManga(manga)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Löschen
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Manga löschen</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Möchtest du "{manga.titel}" wirklich löschen? Diese Aktion kann nicht rückgängig
                                    gemacht werden.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteManga(manga.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Löschen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMangas.length === 0 && (
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
        </Card>
      </div>
    </div>
  )
}
