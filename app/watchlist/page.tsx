"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import MovieCard from "@/components/movie-card"
import { getMovieDetails } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface WatchlistMovie {
  id: string
  movieId: string
  tmdbId: string
  addedAt: string
}

export default function WatchlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      fetchWatchlist()
    }
  }, [status, router])

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/watchlist")

      if (!response.ok) {
        throw new Error("Failed to fetch watchlist")
      }

      const data = await response.json()
      const watchlist = data.watchlist

      if (!watchlist || !watchlist.movies || watchlist.movies.length === 0) {
        setWatchlistMovies([])
        setIsLoading(false)
        return
      }

      // Fetch movie details for each movie in the watchlist
      const movieDetails = await Promise.all(
        watchlist.movies.map(async (movie: WatchlistMovie) => {
          return await getMovieDetails(movie.tmdbId)
        }),
      )

      setWatchlistMovies(movieDetails.filter((movie) => movie.title !== "Movie information unavailable"))
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching watchlist:", error)
      setError("Failed to load your watchlist. Please try again later.")
      setIsLoading(false)
    }
  }

  const removeFromWatchlist = async (movieId: string) => {
    try {
      const response = await fetch("/api/watchlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove movie from watchlist")
      }

      // Update the UI by removing the movie
      setWatchlistMovies((prev) => prev.filter((movie) => movie.id !== movieId))
    } catch (error) {
      console.error("Error removing movie from watchlist:", error)
      setError("Failed to remove movie from watchlist. Please try again.")
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-2">Your Watchlist</h1>
            <p className="text-xl text-center mb-8 text-slate-300">Movies you want to watch</p>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : watchlistMovies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">Your watchlist is empty.</p>
                <Button onClick={() => router.push("/")}>Discover Movies</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {watchlistMovies.map((movie) => (
                  <div key={movie.id} className="relative group">
                    <MovieCard movie={movie} />
                    <button
                      onClick={() => removeFromWatchlist(movie.id)}
                      className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
