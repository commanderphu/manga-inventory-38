"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2, Camera } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ISBNScannerProps {
  onScan: (isbn: string) => void
  onClose: () => void
}

export function ISBNScanner({ onScan, onClose }: ISBNScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [permission, setPermission] = useState<boolean | null>(null)
  const [lastScanTime, setLastScanTime] = useState(0)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const readerRef = useRef<any>(null)

  // Start camera when component mounts
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const constraints = {
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setPermission(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Kamerazugriff nicht möglich. Bitte erlaube den Zugriff auf deine Kamera.")
      setPermission(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (readerRef.current) {
      readerRef.current = null
    }
  }

  const validateISBN = (text: string): string | null => {
    // Remove all non-digit characters except X (for ISBN-10)
    const cleaned = text.replace(/[^0-9X]/gi, "")

    // Check for ISBN-13 (13 digits)
    if (/^\d{13}$/.test(cleaned)) {
      return cleaned
    }

    // Check for ISBN-10 (9 digits + X or 10 digits)
    if (/^\d{9}[\dX]$/i.test(cleaned)) {
      return cleaned
    }

    // Check for EAN-13 starting with 978 or 979 (book codes)
    if (/^97[89]\d{10}$/.test(cleaned)) {
      return cleaned
    }

    return null
  }

  const startScanning = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setScanning(true)
    setError(null)

    try {
      // Dynamic import to avoid SSR issues
      const { BrowserMultiFormatReader, NotFoundException } = await import("@zxing/browser")

      readerRef.current = new BrowserMultiFormatReader()

      // Configure the reader for better barcode detection
      const hints = new Map()
      hints.set(2, true) // TRY_HARDER
      hints.set(3, [8, 13]) // POSSIBLE_FORMATS: EAN_8, EAN_13

      // Scan every 1000ms to reduce CPU load and errors
      scanIntervalRef.current = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const canvas = canvasRef.current as HTMLCanvasElement
          const context = canvas.getContext("2d")

          if (context && readerRef.current) {
            try {
              const video = videoRef.current

              // Set canvas size to match video
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight

              // Draw current video frame to canvas
              context.drawImage(video, 0, 0, canvas.width, canvas.height)

              // Try to decode the barcode
              const result = await readerRef.current.decodeFromCanvas(canvas)
              const text = result.getText()

              console.log("Scanned text:", text)

              // Validate if it's a valid ISBN
              const validISBN = validateISBN(text)

              if (validISBN) {
                // Prevent duplicate scans within 2 seconds
                const now = Date.now()
                if (now - lastScanTime > 2000) {
                  setLastScanTime(now)
                  stopScanning()
                  onScan(validISBN)
                }
              }
            } catch (err) {
              // Ignore NotFoundException and other scanning errors
              // These are normal when no barcode is detected
              if (err.name !== "NotFoundException") {
                console.log("Scanning error (normal):", err.message)
              }
            }
          }
        }
      }, 1000) // Scan every second instead of 500ms
    } catch (err) {
      console.error("Error loading barcode scanner:", err)
      setError("Barcode-Scanner konnte nicht geladen werden. Bitte versuche es erneut.")
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (readerRef.current) {
      try {
        readerRef.current.reset()
      } catch (err) {
        // Ignore reset errors
      }
    }

    setScanning(false)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden">
        {error && (
          <Alert variant="destructive" className="absolute inset-0 m-4 z-10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            // Video is ready, we can start scanning
            console.log("Video loaded, ready to scan")
          }}
        />

        {/* Scanning overlay */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-32 border-2 border-green-500 rounded-lg animate-pulse bg-green-500/10"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                ISBN scannen...
              </div>
            </div>
          </div>
        )}

        {/* Instructions overlay when not scanning */}
        {permission === true && !scanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center bg-black/50 p-4 rounded-lg">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Halte die ISBN in den Rahmen</p>
              <p className="text-xs opacity-75">Stelle sicher, dass der Barcode gut beleuchtet ist</p>
            </div>
          </div>
        )}

        {/* Hidden canvas for barcode detection */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {permission === false && (
          <Button onClick={startCamera} variant="secondary">
            Kamera erneut aktivieren
          </Button>
        )}

        {permission === true && !scanning && (
          <Button onClick={startScanning} className="bg-green-600 hover:bg-green-700">
            <Camera className="h-4 w-4 mr-2" />
            Scanning starten
          </Button>
        )}

        {scanning && (
          <Button onClick={stopScanning} variant="secondary" className="bg-amber-600 hover:bg-amber-700 text-white">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Scanning...
          </Button>
        )}

        <Button onClick={onClose} variant="outline">
          <X className="h-4 w-4 mr-2" />
          Schließen
        </Button>
      </div>

      {/* Tips */}
      <div className="text-xs text-muted-foreground text-center max-w-sm">
        <p className="mb-1">
          💡 <strong>Tipps für besseres Scannen:</strong>
        </p>
        <ul className="text-left space-y-1">
          <li>• Halte das Handy ruhig</li>
          <li>• Sorge für gute Beleuchtung</li>
          <li>• Halte den Barcode parallel zur Kamera</li>
          <li>• Versuche verschiedene Abstände</li>
        </ul>
      </div>
    </div>
  )
}
