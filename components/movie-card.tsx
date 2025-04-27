"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Plus, ThumbsDown, ThumbsUp } from "lucide-react"
import type { Movie } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  isSelected?: boolean
  onSelect?: () => void
  selectionMode?: boolean
}

export default function MovieCard({ movie, isSelected = false, onSelect, selectionMode = false }: MovieCardProps) {
  const [isLiked, setIsLiked] = useState<boolean | null>(null)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [imageError, setImageError] = useState(false)

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const handleImageError = () => {
    setImageError(true)
  }

  return (
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
              onClick={(e) => {
                e.stopPropagation()
                setInWatchlist((prev) => !prev)
              }}
              className={cn(
                "p-1.5 rounded-full",
                inWatchlist ? "bg-emerald-500 text-white" : "bg-white/20 hover:bg-white/30 text-white",
              )}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLiked((prev) => (prev === true ? null : true))
                }}
                className={cn(
                  "p-1.5 rounded-full",
                  isLiked === true ? "bg-emerald-500 text-white" : "bg-white/20 hover:bg-white/30 text-white",
                )}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsLiked((prev) => (prev === false ? null : false))
                }}
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
        {movie.release_date && <p className="text-xs text-slate-400">{new Date(movie.release_date).getFullYear()}</p>}
      </div>
    </div>
  )
}
