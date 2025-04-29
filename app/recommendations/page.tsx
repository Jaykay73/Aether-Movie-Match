import { redirect } from "next/navigation"
import { getMovieRecommendations } from "@/lib/recommendations"
import { getMovieDetails } from "@/lib/tmdb"
import RecommendationList from "@/components/recommendation-list"
import LoadingSkeleton from "@/components/loading-skeleton"
import BackendStatus from "@/components/backend-status"
import Navbar from "@/components/navbar"
import { Suspense } from "react"

export default async function RecommendationsPage({
  searchParams,
}: {
  searchParams: { selectedMovies?: string }
}) {
  const selectedMoviesParam = searchParams.selectedMovies

  // If no movies were selected, redirect back to the selection page
  if (!selectedMoviesParam) {
    redirect("/")
  }

  const selectedMovies = selectedMoviesParam.split(",")

  // Ensure at least 5 movies were selected
  if (selectedMovies.length < 5) {
    redirect("/")
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-2">Your Recommendations</h1>
            <p className="text-xl text-center mb-2 text-slate-300">Based on your movie preferences</p>

            <div className="flex justify-center mb-6">
              <BackendStatus />
            </div>

            <Suspense fallback={<LoadingSkeleton />}>
              <RecommendationContent selectedMovies={selectedMovies} />
            </Suspense>

            <div className="mt-8 text-center">
              <a
                href="/"
                className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors"
              >
                Select Different Movies
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

async function RecommendationContent({ selectedMovies }: { selectedMovies: string[] }) {
  // Get recommendations based on selected movies
  const recommendedMovieIds = await getMovieRecommendations(selectedMovies)

  // Fetch details for each recommended movie
  const recommendedMovies = await Promise.all(
    recommendedMovieIds.map(async (id) => {
      return await getMovieDetails(id)
    }),
  )

  // Filter out any failed movie fetches
  const validMovies = recommendedMovies.filter((movie) => movie.title !== "Movie information unavailable")

  // If no recommendations were found
  if (validMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No recommendations found. Please try selecting different movies.</p>
      </div>
    )
  }

  return <RecommendationList movies={validMovies} />
}
