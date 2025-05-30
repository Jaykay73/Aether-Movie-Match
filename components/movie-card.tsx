"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Check, Plus, ThumbsDown, ThumbsUp, Info } from "lucide-react"
import type { Movie } from "@/lib/types"
import { cn } from "@/lib/utils"
import MovieDetail from "./movie-detail"
import { useRouter } from "next/navigation"

interface MovieCardProps {
  movie: Movie
  isSelected?: boolean
  onSelect?: () => void
  selectionMode?: boolean
}

export default function MovieCard({ movie, isSelected = false, onSelect, selectionMode = false }: MovieCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const handleImageError = () => {
    setImageError(true)
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      setInWatchlist((prev) => !prev)

      if (!inWatchlist) {
        // Add to watchlist
        await fetch("/api/watchlist/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId: movie.id, tmdbId: movie.id }),
        })
      } else {
        // Remove from watchlist
        await fetch("/api/watchlist/remove", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId: movie.id }),
        })
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error)
      setInWatchlist((prev) => !prev) // Revert on error
    }
  }

  const handleLikeToggle = async (e: React.MouseEvent, like: boolean) => {
    e.stopPropagation()

    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      const newLikeState = isLiked === like ? null : like
      setIsLiked(newLikeState)

      if (newLikeState !== null) {
        await fetch("/api/movies/like", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieId: movie.id, tmdbId: movie.id, isLiked: newLikeState }),
        })
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  return (
    <>
      <div
        className={cn(
          "relative rounded-lg overflow-hidden transition-all duration-200 group",
          selectionMode && "cursor-pointer",
          isSelected && "ring-4 ring-emerald-500",
        )}
        onClick={selectionMode ? onSelect : undefined}
      >
        <div className="aspect-[2/3] relative bg-slate-800">
          <Image
            src={imageError ? "/placeholder.svg?height=750&width=500" : posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            onError={handleImageError}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />

          {selectionMode && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isSelected ? "bg-emerald-500" : "bg-white/20",
                )}
              >
                <Check className={cn("w-6 h-6 transition-opacity", isSelected ? "opacity-100" : "opacity-0")} />
              </div>
            </div>
          )}

          {!selectionMode && (
            <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 to-transparent">
              <button
                onClick={handleWatchlistToggle}
                className={cn(
                  "p-1.5 rounded-full",
                  inWatchlist ? "bg-emerald-500 text-white" : "bg-white/20 hover:bg-white/30 text-white",
                )}
              >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => setShowDetails(true)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleLikeToggle(e, true)}
                  className={cn(
                    "p-1.5 rounded-full",
                    isLiked === true ? "bg-emerald-500 text-white" : "bg-white/20 hover:bg-white/30 text-white",
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => handleLikeToggle(e, false)}
                  className={cn(
                    "p-1.5 rounded-full",
                    isLiked === false ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/30 text-white",
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-2 bg-slate-800">
          <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
          {year && <p className="text-xs text-slate-400">{year}</p>}
          {movie.genres && movie.genres.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre) => (
                <span key={genre.id} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDetails && <MovieDetail movie={movie} onClose={() => setShowDetails(false)} />}
    </>
  )
}
