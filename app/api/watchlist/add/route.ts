import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { movieId, tmdbId } = await request.json()

    if (!movieId || !tmdbId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: { watchlist: true },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create watchlist if it doesn't exist
    let watchlist = user.watchlist
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          userId: user.id,
        },
      })
    }

    // Check if movie is already in watchlist
    const existingMovie = await prisma.watchlistMovie.findUnique({
      where: {
        watchlistId_movieId: {
          watchlistId: watchlist.id,
          movieId,
        },
      },
    })

    if (existingMovie) {
      return NextResponse.json({ message: "Movie already in watchlist" }, { status: 409 })
    }

    // Add movie to watchlist
    const watchlistMovie = await prisma.watchlistMovie.create({
      data: {
        watchlistId: watchlist.id,
        movieId,
        tmdbId,
      },
    })

    return NextResponse.json({ message: "Movie added to watchlist", watchlistMovie })
  } catch (error) {
    console.error("Error adding movie to watchlist:", error)
    return NextResponse.json({ message: "An error occurred while adding movie to watchlist" }, { status: 500 })
  }
}
