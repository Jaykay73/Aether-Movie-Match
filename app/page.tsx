import MovieSelection from "@/components/movie-selection"
import { getPopularMovies } from "@/lib/tmdb"

export default async function Home() {
  // Fetch popular movies for the selection page
  const movies = await getPopularMovies()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">Movie Recommender</h1>
          <p className="text-xl text-center mb-8 text-slate-300">
            Select at least 5 movies you've enjoyed to get personalized recommendations
          </p>

          <MovieSelection movies={movies} />
        </div>
      </div>
    </main>
  )
}
