export interface Movie {
  id: string
  title: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  vote_average?: number
  runtime?: number
  genres?: { id: number; name: string }[]
  recommendationCount?: number
}

export interface MovieLink {
  movieId: string
  tmdbId: string
}
