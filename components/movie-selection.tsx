"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MovieCard from "./movie-card"
import { Button } from "@/components/ui/button"
import type { Movie } from "@/lib/types"

interface MovieSelectionProps {
  movies: Movie[]
}

export default function MovieSelection({ movies }: MovieSelectionProps) {
  const [selectedMovies, setSelectedMovies] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovies((prev) => (prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]))
  }

  const handleGetRecommendations = () => {
    if (selectedMovies.length >= 5) {
      router.push(`/recommendations?selectedMovies=${selectedMovies.join(",")}`)
    }
  }

  const filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search movies..."
            className="w-full p-3 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-slate-300">{selectedMovies.length} of 5 movies selected</div>
        <Button
          onClick={handleGetRecommendations}
          disabled={selectedMovies.length < 5}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Get Recommendations
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isSelected={selectedMovies.includes(movie.id)}
            onSelect={() => toggleMovieSelection(movie.id)}
            selectionMode
          />
        ))}
      </div>
    </div>
  )
}
