"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Heart, Plus, Star, X, Check, Clock } from "lucide-react"
import type { Movie } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface MovieDetailProps {
  movie: Movie
  onClose: () => void
}

export default function MovieDetail({ movie, onClose }: MovieDetailProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null

  // Get director
  const director = movie.credits?.crew?.find((person) => person.job === "Director")

  // Get top cast
  const topCast = movie.credits?.cast?.slice(0, 5) || []

  const handleWatchlistToggle = async () => {
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

  const handleLikeToggle = async () => {
    if (!session) {
      router.push("/auth/signin")
      return
    }

    try {
      const newLikeState = !isLiked
      setIsLiked(newLikeState)

      await fetch("/api/movies/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId: movie.id, tmdbId: movie.id, isLiked: newLikeState }),
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      setIsLiked((prev) => !prev) // Revert on error
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 overflow-y-auto">
      <div
        className="absolute inset-0 z-0"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="Close details"
      ></div>
      <div className="relative bg-slate-900 rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col z-10">
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
              priority
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
                priority
              />
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleWatchlistToggle} className="flex-1" variant={inWatchlist ? "default" : "outline"}>
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
                onClick={handleLikeToggle}
                variant="outline"
                className={isLiked ? "bg-red-500 text-white border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">{movie.title}</h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 mb-4">
              {movie.release_date && <p className="text-slate-400">{new Date(movie.release_date).getFullYear()}</p>}

              {movie.runtime && movie.runtime > 0 && (
                <div className="flex items-center text-slate-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                </div>
              )}

              {movie.vote_average && movie.vote_average > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

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

            {director && (
              <div className="mb-2">
                <span className="text-slate-400">Director: </span>
                <span className="text-slate-200">{director.name}</span>
              </div>
            )}

            {topCast.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {topCast.map((person) => (
                    <span key={person.id} className="px-2 py-1 bg-slate-800 rounded-md text-xs">
                      {person.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movie.videos && movie.videos.results && movie.videos.results.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Trailer</h3>
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                    title={`${movie.title} trailer`}
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
