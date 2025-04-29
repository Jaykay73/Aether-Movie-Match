"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import MovieCard from "@/components/movie-card"
import { getMovieDetails, getPopularMovies } from "@/lib/tmdb"
import type { Movie } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Preference {
  id: string
  movieId: string
  tmdbId: string
}

export default function PreferencesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [preferredMovies, setPreferredMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      fetchPreferences()
      fetchPopularMovies()
    }
  }, [status, router])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/preferences")

      if (!response.ok) {
        throw new Error("Failed to fetch preferences")
      }

      const data = await response.json()
      const preferences = data.preferences

      if (!preferences || preferences.length === 0) {
        setPreferredMovies([])
        setIsLoading(false)
        return
      }

      // Fetch movie details for each preferred movie
      const movieDetails = await Promise.all(
        preferences.map(async (pref: Preference) => {
          return await getMovieDetails(pref.tmdbId)
        }),
      )

      setPreferredMovies(movieDetails.filter((movie) => movie.title !== "Movie information unavailable"))
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching preferences:", error)
      setError("Failed to load your preferences. Please try again later.")
      setIsLoading(false)
    }
  }

  const fetchPopularMovies = async () => {
    try {
      const movies = await getPopularMovies()
      setPopularMovies(movies)
    } catch (error) {
      console.error("Error fetching popular movies:", error)
    }
  }

  const addToPreferences = async (movie: Movie) => {
    try {
      // Check if movie is already in preferences
      if (preferredMovies.some((m) => m.id === movie.id)) {
        return
      }

      // Add to UI immediately for better UX
      setPreferredMovies((prev) => [...prev, movie])

      // Save to backend
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieIds: [{ movieId: movie.id, tmdbId: movie.id }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save preference")
      }
    } catch (error) {
      console.error("Error adding movie to preferences:", error)
      // Revert UI change if there was an error
      setPreferredMovies((prev) => prev.filter((m) => m.id !== movie.id))
      setError("Failed to add movie to preferences. Please try again.")
    }
  }

  const removeFromPreferences = async (movieId: string) => {
    try {
      // Remove from UI immediately for better UX
      setPreferredMovies((prev) => prev.filter((movie) => movie.id !== movieId))

      // Save updated preferences to backend
      const updatedPreferences = preferredMovies
        .filter((movie) => movie.id !== movieId)
        .map((movie) => ({ movieId: movie.id, tmdbId: movie.id }))

      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieIds: updatedPreferences }),
      })

      if (!response.ok) {
        throw new Error("Failed to update preferences")
      }
    } catch (error) {
      console.error("Error removing movie from preferences:", error)
      // Revert UI change if there was an error
      fetchPreferences()
      setError("Failed to remove movie from preferences. Please try again.")
    }
  }

  const filteredPopularMovies = popularMovies.filter((movie) => {
    return (
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) && !preferredMovies.some((m) => m.id === movie.id)
    )
  })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-2">Your Preferences</h1>
            <p className="text-xl text-center mb-8 text-slate-300">Movies you like that influence recommendations</p>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Your Preferred Movies</h2>
                {preferredMovies.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/50 rounded-lg mb-8">
                    <p className="text-slate-400 mb-4">You haven't added any preferred movies yet.</p>
                    <p className="text-slate-400 mb-4">
                      Add movies from the list below to improve your recommendations.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
                    {preferredMovies.map((movie) => (
                      <div key={movie.id} className="relative group">
                        <MovieCard movie={movie} />
                        <button
                          onClick={() => removeFromPreferences(movie.id)}
                          className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove from preferences"
                        >
                          <span className="text-lg font-bold">×</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Add More Movies</h2>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search for movies..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredPopularMovies.slice(0, 10).map((movie) => (
                      <div key={movie.id} className="relative group">
                        <MovieCard movie={movie} />
                        <button
                          onClick={() => addToPreferences(movie)}
                          className="absolute top-2 right-2 p-2 bg-emerald-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Add to preferences"
                        >
                          <span className="text-lg font-bold">+</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
