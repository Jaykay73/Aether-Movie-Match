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
  credits?: {
    cast?: {
      id: number
      name: string
      character: string
      profile_path?: string
    }[]
    crew?: {
      id: number
      name: string
      job: string
    }[]
  }
  videos?: {
    results: {
      id: string
      key: string
      name: string
      site: string
      type: string
    }[]
  }
}

export interface MovieLink {
  movieId: string
  tmdbId: string
}
