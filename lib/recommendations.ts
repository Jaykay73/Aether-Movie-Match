import type { MovieLink } from "./types"

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

// Convert movieIds to tmdbIds using the links data
async function convertToTmdbIds(movieIds: string[]): Promise<string[]> {
  const links = await getMovieLinks()

  return movieIds
    .map((movieId) => {
      const link = links.find((link) => link.movieId === movieId)
      return link?.tmdbId
    })
    .filter((id): id is string => id !== undefined)
}

// Mock function to simulate backend recommendation API call
// In a real app, this would make an actual API call to the backend
async function fetchRecommendations(movieIds: string[]): Promise<string[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // This is a mock implementation
  // In a real app, you would call your backend API
  // For now, we'll return some hardcoded movieIds as recommendations
  const mockRecommendations = ["862", "597", "120", "11216", "58", "4993", "79132", "1726", "109445", "76341"]

  return mockRecommendations
}

// Get movie recommendations based on selected movies
export async function getMovieRecommendations(selectedMovieIds: string[]): Promise<string[]> {
  try {
    // Convert selected TMDB IDs to movie IDs using the links data
    const movieIds = await convertToTmdbIds(selectedMovieIds)

    // Call the backend recommendation API
    const recommendedMovieIds = await fetchRecommendations(movieIds)

    // Convert recommended movie IDs back to TMDB IDs
    const recommendedTmdbIds = await convertToTmdbIds(recommendedMovieIds)

    return recommendedTmdbIds
  } catch (error) {
    console.error("Error getting movie recommendations:", error)
    return []
  }
}
