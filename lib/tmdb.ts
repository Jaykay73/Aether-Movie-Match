import type { Movie } from "./types"

const TMDB_API_KEY = "bb22ff5ccc9a19ec56cf83148370714c"
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

// Fetch popular movies from TMDB API
export async function getPopularMovies(): Promise<Movie[]> {
  try {
    // Fetch multiple pages to get a diverse set of movies
    const [page1, page2] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
      fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=2`),
    ])

    if (!page1.ok || !page2.ok) {
      throw new Error("Failed to fetch popular movies")
    }

    const data1 = await page1.json()
    const data2 = await page2.json()

    // Combine results and take the first 35
    const allMovies = [...data1.results, ...data2.results].slice(0, 35)

    return allMovies.map((movie) => ({
      id: movie.id.toString(),
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    }))
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return []
  }
}

// Fetch movie details from TMDB API
export async function getMovieDetails(tmdbId: string): Promise<Movie> {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`)

    if (!response.ok) {
      throw new Error(`Failed to fetch movie details for ID: ${tmdbId}`)
    }

    const data = await response.json()

    return {
      id: data.id.toString(),
      title: data.title,
      overview: data.overview,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      vote_average: data.vote_average,
      runtime: data.runtime,
      genres: data.genres,
    }
  } catch (error) {
    console.error(`Error fetching movie details for ID ${tmdbId}:`, error)
    return {
      id: tmdbId,
      title: "Movie information unavailable",
    }
  }
}
