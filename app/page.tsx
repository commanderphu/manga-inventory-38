import { Suspense } from "react"
import MangaCollection from "../manga-collection"
import { Skeleton } from "@/components/ui/skeleton"

function MangaCollectionWrapper() {
  return <MangaCollection />
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-12 w-96 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MangaCollectionWrapper />
    </Suspense>
  )
}
