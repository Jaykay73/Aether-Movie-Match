"use client"

import Image from "next/image"

export default function MovieCard({ movie, isSelected = false, onSelect, selectionMode = false }) {
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.png"

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null

  return (
    <div
      className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
        selectionMode ? "cursor-pointer" : ""
      } ${isSelected ? "ring-4 ring-green-500" : ""}`}
      onClick={selectionMode ? onSelect : undefined}
    >
      <div className="aspect-[2/3] relative bg-gray-800">
        <Image
          src={posterUrl || "/placeholder.png"}
          alt={movie.title}
          fill
          className="object-cover"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "/placeholder.png"
          }}
        />

        {selectionMode && (
          <div
            className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity ${
              isSelected ? "opacity-100" : "opacity-0 hover:opacity-100"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isSelected ? "bg-green-500" : "bg-white/20"
              }`}
            >
              {isSelected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 bg-gray-800">
        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
        {year && <p className="text-xs text-gray-400">{year}</p>}
        {movie.genres && movie.genres.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((genre) => (
              <span key={genre.id} className="px-1.5 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
