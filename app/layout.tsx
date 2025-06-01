import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Manga-Collection - Jessy ¬ Phu',
  description: ' A completed Manga -Collection with Xecel Import and ISBN Sanner',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
