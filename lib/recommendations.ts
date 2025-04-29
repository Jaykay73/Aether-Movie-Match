import type { MovieLink } from "./types"
import { getFallbackRecommendations } from "./fallback-recommendations"

// In-memory cache for movie links
let movieLinksCache: MovieLink[] | null = null

// Fetch and parse the links_snippet.csv file
async function getMovieLinks(): Promise<MovieLink[]> {
  // Return cached data if available
  if (movieLinksCache) {
    return movieLinksCache
  }

  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/links_snippet-WPS2K55pUpSA7SNXUzIxYf4PePgte9.csv",
    )

    if (!response.ok) {
      throw new Error("Failed to fetch movie links data")
    }

    const csvText = await response.text()

    // Parse CSV (simple implementation)
    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    const movieIdIndex = headers.indexOf("movieId")
    const tmdbIdIndex = headers.indexOf("tmdbId")

    if (movieIdIndex === -1 || tmdbIdIndex === -1) {
      throw new Error("CSV format is not as expected")
    }

    const links: MovieLink[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",")

      if (values.length >= Math.max(movieIdIndex, tmdbIdIndex) + 1) {
        links.push({
          movieId: values[movieIdIndex].trim(),
          tmdbId: values[tmdbIdIndex].trim(),
        })
      }
    }

    // Cache the results
    movieLinksCache = links

    return links
  } catch (error) {
    console.error("Error fetching or parsing movie links:", error)
    return []
  }
}

// Convert TMDB IDs to movie IDs
async function convertToMovieIds(tmdbIds: string[]): Promise<string[]> {
  const links = await getMovieLinks()

  return tmdbIds
    .map((tmdbId) => {
      const link = links.find((link) => link.tmdbId === tmdbId)
      return link?.movieId
    })
    .filter((id): id is string => id !== undefined)
}

// Convert movie IDs to TMDB IDs
async function convertToTmdbIds(movieIds: string[]): Promise<string[]> {
  const links = await getMovieLinks()

  return movieIds
    .map((movieId) => {
      const link = links.find((link) => link.movieId === movieId)
      return link?.tmdbId
    })
    .filter((id): id is string => id !== undefined)
}

// Get movie recommendations based on selected movies
export async function getMovieRecommendations(selectedTmdbIds: string[]): Promise<string[]> {
  try {
    // Convert selected TMDB IDs to movie IDs
    const movieIds = await convertToMovieIds(selectedTmdbIds)

    if (movieIds.length === 0) {
      console.warn("No valid movie IDs found for the selected TMDB IDs")
      return getFallbackRecommendations(selectedTmdbIds)
    }

    // Call our API route that connects to the Render backend
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ movieIds }),
    })

    if (!response.ok) {
      console.error("Backend recommendation error")
      return getFallbackRecommendations(selectedTmdbIds)
    }

    const recommendedMovieIds = await response.json()

    if (!Array.isArray(recommendedMovieIds) || recommendedMovieIds.length === 0) {
      console.warn("Backend returned no recommendations or invalid format")
      return getFallbackRecommendations(selectedTmdbIds)
    }

    // Convert recommended movie IDs back to TMDB IDs if they're not already
    let recommendedTmdbIds = recommendedMovieIds

    // Check if the IDs look like TMDB IDs or need conversion
    if (recommendedMovieIds.some((id) => !id.toString().match(/^\d+$/))) {
      recommendedTmdbIds = await convertToTmdbIds(recommendedMovieIds)
    }

    if (recommendedTmdbIds.length === 0) {
      console.warn("No valid TMDB IDs found for the recommended movie IDs")
      return getFallbackRecommendations(selectedTmdbIds)
    }

    return recommendedTmdbIds
  } catch (error) {
    console.error("Error getting movie recommendations:", error)
    return getFallbackRecommendations(selectedTmdbIds)
  }
}
