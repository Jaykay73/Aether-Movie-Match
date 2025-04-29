import { NextResponse } from "next/server"

// Updated backend URL to use the Render deployment
const BACKEND_URL = "https://movie-recommender-backend-oye5.onrender.com/recommend"

export async function GET() {
  try {
    // Try to connect to the backend with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // Increased timeout for external service

    const response = await fetch(BACKEND_URL, {
      method: "HEAD",
      signal: controller.signal,
    }).catch(() => null)

    clearTimeout(timeoutId)

    if (response && response.ok) {
      return NextResponse.json({ status: "online" })
    } else {
      return NextResponse.json({ status: "offline" })
    }
  } catch (error) {
    return NextResponse.json({ status: "offline" })
  }
}
