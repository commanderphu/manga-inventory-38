"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Star,
  Copy,
  ShoppingCart,
  Loader2,
  Search,
  Camera,
  Heart,
  Sparkles,
} from "lucide-react"
import { mangaAPI, type Manga } from "@/lib/api"
import { SimpleISBNScanner } from "@/components/simple-isbn-scanner"

function MangaDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mangaId = searchParams.get("id")

  const [manga, setManga] = useState<Manga | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingManga, setEditingManga] = useState<Manga | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isLoadingISBN, setIsLoadingISBN] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })

  useEffect(() => {
    if (!mangaId) {
      setError("Keine Manga-ID angegeben")
      setLoading(false)
      return
    }

    fetchManga()
  }, [mangaId])

  const fetchManga = async () => {
    if (!mangaId) return

    setLoading(true)
    setError(null)

    try {
      const response = await mangaAPI.getManga(mangaId)
      setManga(response.data)
    } catch (err) {
      setError("Manga nicht gefunden")
      console.error("Error fetching manga:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEditManga = () => {
    if (manga) {
      setEditingManga(manga)
      setIsEditDialogOpen(true)
    }
  }

  const handleUpdateManga = async () => {
    if (!editingManga || !editingManga.titel) {
      setStatus({
        type: "error",
        message: "Titel ist erforderlich! 📝",
      })
      return
    }

    try {
      setLoading(true)
      const { id, createdAt, updatedAt, ...updateData } = editingManga
      await mangaAPI.updateManga(id, updateData)
      setManga(editingManga)
      setEditingManga(null)
      setIsEditDialogOpen(false)
      setStatus({
        type: "success",
        message: "Manga erfolgreich aktualisiert! 🎉",
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: "Fehler beim Aktualisieren des Manga! 😅",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteManga = async () => {
    if (!manga) return

    try {
      await mangaAPI.deleteManga(manga.id)
      setStatus({
        type: "success",
        message: "Manga erfolgreich gelöscht! 🗑️",
      })
      // Redirect to main page after deletion
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error) {
      setStatus({
        type: "error",
        message: "Fehler beim Löschen des Manga! 😅",
      })
    }
  }

  const toggleStatus = async (field: "read" | "double" | "newbuy") => {
    if (!manga) return

    try {
      const updatedValue = !manga[field]
      await mangaAPI.updateManga(manga.id, { [field]: updatedValue })
      setManga({ ...manga, [field]: updatedValue })
      setStatus({
        type: "success",
        message: "Status erfolgreich aktualisiert! ✨",
      })
    } catch (error) {
      setStatus({
        type: "error",
        message: "Fehler beim Aktualisieren des Status! 😅",
      })
    }
  }

  const handleISBNScan = async (isbn: string) => {
    setIsScannerOpen(false)
    setIsLoadingISBN(true)

    try {
      const response = await mangaAPI.getISBNMetadata(isbn)

      if (response.data && editingManga) {
        setEditingManga({
          ...editingManga,
          ...response.data,
          isbn: isbn,
        })

        setStatus({
          type: "success",
          message: `ISBN ${isbn} erfolgreich gescannt und Metadaten geladen! 📚`,
        })
      }
    } catch (error) {
      console.error("Error fetching ISBN metadata:", error)
      setStatus({
        type: "error",
        message: `ISBN ${isbn} gescannt, aber keine Metadaten gefunden. 😢`,
      })
    } finally {
      setIsLoadingISBN(false)
    }
  }

  const handleISBNLookup = async (isbn: string) => {
    if (!isbn || isbn.length < 10 || !editingManga) return

    setIsLoadingISBN(true)

    try {
      const response = await mangaAPI.getISBNMetadata(isbn)

      if (response.data) {
        setEditingManga({
          ...editingManga,
          ...response.data,
          isbn: isbn,
        })

        setStatus({
          type: "success",
          message: `Metadaten für ISBN ${isbn} erfolgreich geladen! 📚`,
        })
      }
    } catch (error) {
      console.error("Error fetching ISBN metadata:", error)
      setStatus({
        type: "error",
        message: `Keine Metadaten für ISBN ${isbn} gefunden. 😢`,
      })
    } finally {
      setIsLoadingISBN(false)
    }
  }

  // Clear status after 3 seconds
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status.type])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 w-full" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto p-6 space-y-6">
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.delete("id")
              const newUrl = params.toString() ? `/?${params.toString()}` : "/"
              router.push(newUrl)
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Sammlung
          </Button>
          <Alert className="border-red-400 bg-red-50">
            <AlertDescription className="font-medium text-red-700">{error || "Manga nicht gefunden"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            className="border-purple-200 hover:bg-purple-50 w-full sm:w-auto"
            onClick={() => {
              // Erstelle neue URLSearchParams basierend auf den aktuellen searchParams
              const params = new URLSearchParams(searchParams.toString())
              params.delete("id") // Entferne nur die ID

              // Gehe zur Hauptseite mit allen anderen Parametern zurück
              const newUrl = params.toString() ? `/?${params.toString()}` : "/"
              router.push(newUrl)
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Sammlung
          </Button>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-pink-500" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Manga Details
            </h1>
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
          </div>
        </div>

        {/* Status Alert */}
        {status.type && (
          <Alert
            className={`${status.type === "success" ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"} shadow-lg`}
          >
            <AlertDescription className="font-medium text-sm md:text-base">{status.message}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Cover Image */}
          <Card className="shadow-xl border-purple-200 order-1 lg:order-1">
            <CardContent className="p-4 md:p-6">
              <div className="aspect-[3/4] max-w-sm mx-auto lg:max-w-none bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center overflow-hidden shadow-lg">
                {manga.coverImage && manga.coverImage !== "/placeholder.svg?height=120&width=80" ? (
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
                <div className="text-center text-purple-400">
                  <BookOpen className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-2" />
                  <p className="text-xs md:text-sm">Kein Cover verfügbar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-2">
            {/* Title and Actions */}
            <Card className="shadow-xl border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6">
                <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-xl md:text-2xl text-purple-900 break-words">{manga.titel}</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button
                      onClick={handleEditManga}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 w-full sm:w-auto"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Manga löschen</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Möchtest du "{manga.titel}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht
                            werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteManga}
                            className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-purple-700">Band</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        Band {manga.band}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-purple-700">Sprache</Label>
                    <div className="mt-1">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {manga.sprache}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-purple-700">Autor</Label>
                    <p className="text-sm mt-1 break-words">
                      {manga.autor || <span className="text-muted-foreground italic">Nicht angegeben</span>}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-purple-700">Verlag</Label>
                    <p className="text-sm mt-1 break-words">
                      {manga.verlag || <span className="text-muted-foreground italic">Nicht angegeben</span>}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-purple-700">ISBN</Label>
                    <p className="text-sm font-mono mt-1 break-all">{manga.isbn}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-purple-700">Genre</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {manga.genre.split(",").map((g, i) => (
                      <Badge key={i} variant="secondary" className="bg-pink-100 text-pink-700 text-xs">
                        {g.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="shadow-xl border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 md:p-6">
                <CardTitle className="text-purple-700 text-lg md:text-xl">Status</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div
                    className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      manga.read
                        ? "border-green-300 bg-green-50 shadow-md"
                        : "border-gray-200 bg-gray-50 hover:border-green-200"
                    }`}
                    onClick={() => toggleStatus("read")}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Checkbox checked={manga.read} readOnly />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-sm md:text-base">Gelesen</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Klicken zum Ändern</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      manga.double
                        ? "border-orange-300 bg-orange-50 shadow-md"
                        : "border-gray-200 bg-gray-50 hover:border-orange-200"
                    }`}
                    onClick={() => toggleStatus("double")}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Checkbox checked={manga.double} readOnly />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Copy className="h-4 w-4 text-orange-600 flex-shrink-0" />
                          <span className="font-medium text-sm md:text-base">Doppelt</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Klicken zum Ändern</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all sm:col-span-2 lg:col-span-1 ${
                      manga.newbuy
                        ? "border-purple-300 bg-purple-50 shadow-md"
                        : "border-gray-200 bg-gray-50 hover:border-purple-200"
                    }`}
                    onClick={() => toggleStatus("newbuy")}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <Checkbox checked={manga.newbuy} readOnly />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span className="font-medium text-sm md:text-base">Neu kaufen</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Klicken zum Ändern</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="mx-4 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-700 text-lg">Manga bearbeiten ✏️</DialogTitle>
            </DialogHeader>
            {editingManga && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-titel" className="text-sm">
                    Titel *
                  </Label>
                  <Input
                    id="edit-titel"
                    value={editingManga.titel}
                    onChange={(e) => setEditingManga({ ...editingManga, titel: e.target.value })}
                    placeholder="Manga-Titel"
                    className="border-purple-200 focus:border-purple-400 text-sm"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-band" className="text-sm">
                      Band
                    </Label>
                    <Input
                      id="edit-band"
                      value={editingManga.band}
                      onChange={(e) => setEditingManga({ ...editingManga, band: e.target.value })}
                      placeholder="Band-Nr."
                      className="border-purple-200 focus:border-purple-400 text-sm"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-sprache" className="text-sm">
                      Sprache
                    </Label>
                    <Input
                      id="edit-sprache"
                      value={editingManga.sprache}
                      onChange={(e) => setEditingManga({ ...editingManga, sprache: e.target.value })}
                      placeholder="Deutsch"
                      className="border-purple-200 focus:border-purple-400 text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-genre" className="text-sm">
                    Genre
                  </Label>
                  <Input
                    id="edit-genre"
                    value={editingManga.genre}
                    onChange={(e) => setEditingManga({ ...editingManga, genre: e.target.value })}
                    placeholder="z.B. Shonen, Action"
                    className="border-purple-200 focus:border-purple-400 text-sm"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-autor" className="text-sm">
                    Autor
                  </Label>
                  <Input
                    id="edit-autor"
                    value={editingManga.autor}
                    onChange={(e) => setEditingManga({ ...editingManga, autor: e.target.value })}
                    placeholder="Autor-Name"
                    className="border-purple-200 focus:border-purple-400 text-sm"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-verlag" className="text-sm">
                    Verlag
                  </Label>
                  <Input
                    id="edit-verlag"
                    value={editingManga.verlag}
                    onChange={(e) => setEditingManga({ ...editingManga, verlag: e.target.value })}
                    placeholder="Verlag"
                    className="border-purple-200 focus:border-purple-400 text-sm"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="edit-isbn" className="text-sm">
                        ISBN
                      </Label>
                      <Input
                        id="edit-isbn"
                        value={editingManga.isbn}
                        onChange={(e) => setEditingManga({ ...editingManga, isbn: e.target.value })}
                        placeholder="ISBN-Nummer"
                        className="border-purple-200 focus:border-purple-400 text-sm"
                        disabled={loading || isLoadingISBN}
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleISBNLookup(editingManga.isbn)}
                        disabled={loading || isLoadingISBN || !editingManga.isbn}
                        className="h-9 w-9"
                      >
                        {isLoadingISBN ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsScannerOpen(true)}
                        disabled={loading || isLoadingISBN}
                        className="h-9 w-9"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-coverImage" className="text-sm">
                    Cover-Bild URL
                  </Label>
                  <Input
                    id="edit-coverImage"
                    value={editingManga.coverImage}
                    onChange={(e) => setEditingManga({ ...editingManga, coverImage: e.target.value })}
                    placeholder="URL zum Cover-Bild"
                    className="border-purple-200 focus:border-purple-400 text-sm"
                    disabled={loading}
                  />
                  {editingManga.coverImage && editingManga.coverImage !== "/placeholder.svg?height=120&width=80" && (
                    <div className="mt-2 flex justify-center">
                      <img
                        src={editingManga.coverImage || "/placeholder.svg"}
                        alt="Cover Vorschau"
                        className="h-32 md:h-40 object-contain rounded-md border border-purple-200"
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
                      id="edit-read"
                      checked={editingManga.read}
                      onCheckedChange={(checked) => setEditingManga({ ...editingManga, read: checked as boolean })}
                      disabled={loading}
                    />
                    <Label htmlFor="edit-read" className="text-sm">
                      Gelesen ⭐
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-double"
                      checked={editingManga.double}
                      onCheckedChange={(checked) => setEditingManga({ ...editingManga, double: checked as boolean })}
                      disabled={loading}
                    />
                    <Label htmlFor="edit-double" className="text-sm">
                      Doppelt vorhanden 📚
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-newbuy"
                      checked={editingManga.newbuy}
                      onCheckedChange={(checked) => setEditingManga({ ...editingManga, newbuy: checked as boolean })}
                      disabled={loading}
                    />
                    <Label htmlFor="edit-newbuy" className="text-sm">
                      Neu kaufen 🛒
                    </Label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleUpdateManga}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Aktualisieren ✨
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                    disabled={loading}
                    size="sm"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ISBN Scanner Dialog */}
        <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
          <DialogContent className="mx-4 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-700 text-lg">ISBN scannen 📷</DialogTitle>
            </DialogHeader>
            <SimpleISBNScanner onScan={handleISBNScan} onClose={() => setIsScannerOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function MangaDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
          <div className="container mx-auto p-6 space-y-6">
            <Skeleton className="h-10 w-32" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 w-full" />
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <MangaDetailContent />
    </Suspense>
  )
}
