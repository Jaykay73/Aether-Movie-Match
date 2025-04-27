"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Plus, Star, X, Check } from "lucide-react"
import type { Movie } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface MovieDetailProps {
  movie: Movie
  onClose: () => void
}

export default function MovieDetail({ movie, onClose }: MovieDetailProps) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="relative bg-slate-900 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <X className="w-5 h-5" />
        </button>

        {backdropUrl && (
          <div className="relative h-64 w-full">
            <Image
              src={backdropUrl || "/placeholder.svg"}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          </div>
        )}

        <div className="p-6 flex flex-col md:flex-row gap-6 overflow-y-auto">
          <div className="flex-shrink-0 w-full md:w-1/3">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
              <Image
                src={posterUrl || "/placeholder.svg"}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setInWatchlist((prev) => !prev)}
                className="flex-1"
                variant={inWatchlist ? "default" : "outline"}
              >
                {inWatchlist ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    In Watchlist
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Watchlist
                  </>
                )}
              </Button>

              <Button
                onClick={() => setIsLiked((prev) => !prev)}
                variant="outline"
                className={isLiked ? "bg-red-500 text-white border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{movie.title}</h2>

            {movie.release_date && (
              <p className="text-slate-400 mb-2">
                {new Date(movie.release_date).getFullYear()}
                {movie.runtime && ` • ${movie.runtime} min`}
              </p>
            )}

            {movie.vote_average > 0 && (
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                <span className="text-slate-400 ml-1">/ 10</span>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="px-2 py-1 bg-slate-800 rounded-md text-xs">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Overview</h3>
                <p className="text-slate-300">{movie.overview}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
