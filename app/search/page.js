"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchIcon, Loader2 } from "lucide-react"
import AnimeCard from "@/components/AnimeCard"
import { AnimeGridSkeleton } from "@/components/LoadingSkeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setQuery(q)
      searchAnime(q)
    } else {
      searchAnime("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const searchAnime = async (searchQuery) => {
    try {
      setLoading(true)
      setError(null)

      const url = searchQuery.trim() ? `/api/anime/search?q=${encodeURIComponent(searchQuery)}` : "/api/anime/latest"

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResults(data.data || [])
      } else {
        setError(data.error || "Failed to load anime")
      }
    } catch (err) {
      console.error("Error loading anime:", err)
      setError("Failed to load anime. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Search Anime</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for anime..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      {loading && <AnimeGridSkeleton count={12} />}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => searchAnime(query)}>Try Again</Button>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div>
          {searchParams.get("q") ? (
            <p className="text-muted-foreground mb-6">
              Found {results.length} result{results.length !== 1 ? "s" : ""} for "{searchParams.get("q")}"
            </p>
          ) : (
            <p className="text-muted-foreground mb-6">Showing {results.length} latest anime</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {results.map((anime, index) => (
              <AnimeCard key={`${anime.slug}-${index}`} anime={anime} />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && searchParams.get("q") && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No results found for "{searchParams.get("q")}"</p>
          <p className="text-sm text-muted-foreground">Try searching with different keywords</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Search Anime</h1>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="text" placeholder="Search for anime..." disabled className="pl-10" />
              </div>
              <Button disabled>Search</Button>
            </div>
          </div>
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
