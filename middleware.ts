import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the request is for the backend API
  if (request.nextUrl.pathname.startsWith("/api/backend/")) {
    // Rewrite the URL to the actual backend URL
    // Assuming the backend is running at http://localhost:5000
    const backendUrl = new URL(request.nextUrl.pathname.replace("/api/backend/", ""), "http://localhost:5000")

    // Copy search params
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value)
    })

    return NextResponse.rewrite(backendUrl)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/backend/:path*",
}
