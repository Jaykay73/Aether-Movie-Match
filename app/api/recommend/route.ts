import { NextResponse } from "next/server"
import { getFallbackRecommendations } from "@/lib/fallback-recommendations"

// Updated backend URL to use the Render deployment
const BACKEND_URL = "https://movie-recommender-backend-oye5.onrender.com/recommend"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to the Flask backend
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(`Backend error: ${response.status}`)
      // Fall back to our built-in recommendations
      return NextResponse.json(getFallbackRecommendations(body.movieIds || []))
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in recommend API route:", error)

    // If the backend is not available, use fallback recommendations
    const body = await request.json().catch(() => ({}))
    return NextResponse.json(getFallbackRecommendations(body.movieIds || []))
  }
}
