import { NextResponse } from "next/server"

// Backend URL - in production, this would be an environment variable
const BACKEND_URL = "http://localhost:5000/recommend"

export async function GET() {
  try {
    // Try to connect to the backend with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

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
