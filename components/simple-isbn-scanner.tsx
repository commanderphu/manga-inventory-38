"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search, Camera } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SimpleISBNScannerProps {
  onScan: (isbn: string) => void
  onClose: () => void
}

export function SimpleISBNScanner({ onScan, onClose }: SimpleISBNScannerProps) {
  const [manualISBN, setManualISBN] = useState("")
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateISBN = (text: string): string | null => {
    const cleaned = text.replace(/[^0-9X]/gi, "")

    if (/^\d{13}$/.test(cleaned) || /^\d{9}[\dX]$/i.test(cleaned) || /^97[89]\d{10}$/.test(cleaned)) {
      return cleaned
    }

    return null
  }

  const handleManualSubmit = () => {
    const validISBN = validateISBN(manualISBN)
    if (validISBN) {
      onScan(validISBN)
    } else {
      setError("Bitte gib eine gültige ISBN ein (10 oder 13 Stellen)")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      // Create image element
      const img = new Image()
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      img.onload = async () => {
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        try {
          const { BrowserMultiFormatReader } = await import("@zxing/browser")
          const reader = new BrowserMultiFormatReader()

          const result = await reader.decodeFromCanvas(canvas)
          const text = result.getText()

          const validISBN = validateISBN(text)
          if (validISBN) {
            onScan(validISBN)
          } else {
            setError("Kein gültiger ISBN-Barcode im Bild gefunden")
          }
        } catch (err) {
          setError("Kein Barcode im Bild erkannt. Versuche es mit einem anderen Bild.")
        }
      }

      img.src = URL.createObjectURL(file)
    } catch (err) {
      setError("Fehler beim Verarbeiten des Bildes")
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Manual ISBN Input */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="manual-isbn" className="text-base font-medium">
            ISBN manuell eingeben
          </Label>
          <p className="text-sm text-muted-foreground">Gib die 10- oder 13-stellige ISBN-Nummer ein</p>
        </div>

        <div className="flex gap-2">
          <Input
            id="manual-isbn"
            value={manualISBN}
            onChange={(e) => {
              setManualISBN(e.target.value)
              setError(null)
            }}
            placeholder="z.B. 9783551752710"
            className="flex-1"
          />
          <Button onClick={handleManualSubmit} disabled={!manualISBN.trim()}>
            <Search className="h-4 w-4 mr-2" />
            Suchen
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">oder</span>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="image-upload" className="text-base font-medium">
            Barcode-Foto hochladen
          </Label>
          <p className="text-sm text-muted-foreground">Mache ein Foto vom Barcode und lade es hoch</p>
        </div>

        <div className="flex gap-2">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="flex-1"
          />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Camera className="h-4 w-4 mr-2" />
            Foto
          </Button>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Schließen
        </Button>
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
        <p className="font-medium mb-2">💡 Tipps:</p>
        <ul className="space-y-1">
          <li>• Die ISBN findest du meist auf der Rückseite des Buches</li>
          <li>• Achte auf gute Beleuchtung beim Fotografieren</li>
          <li>• Der Barcode sollte scharf und vollständig sichtbar sein</li>
        </ul>
      </div>
    </div>
  )
}
