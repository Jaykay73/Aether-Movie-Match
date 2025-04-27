"use client"

import { useState } from "react"
import MovieCard from "./movie-card"
import type { Movie } from "@/lib/types"

interface RecommendationListProps {
  movies: Movie[]
}

export default function RecommendationList({ movies }: RecommendationListProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)

  // Extract all unique genres from the movies
  const allGenres = Array.from(new Set(movies.flatMap((movie) => movie.genres?.map((genre) => genre.name) || [])))

  // Filter movies by selected genre if any
  const filteredMovies = selectedGenre
    ? movies.filter((movie) => movie.genres?.some((genre) => genre.name === selectedGenre))
    : movies

  return (
    <div>
      {allGenres.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedGenre === null ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            All
          </button>

          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedGenre === genre ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No movies found for this genre.</p>
        </div>
      )}
    </div>
  )
}
