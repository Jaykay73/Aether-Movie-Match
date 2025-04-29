import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/db"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { movieId } = await request.json()

    if (!movieId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: { watchlist: true },
    })

    if (!user || !user.watchlist) {
      return NextResponse.json({ message: "User or watchlist not found" }, { status: 404 })
    }

    // Remove movie from watchlist
    await prisma.watchlistMovie.deleteMany({
      where: {
        watchlistId: user.watchlist.id,
        movieId,
      },
    })

    return NextResponse.json({ message: "Movie removed from watchlist" })
  } catch (error) {
    console.error("Error removing movie from watchlist:", error)
    return NextResponse.json({ message: "An error occurred while removing movie from watchlist" }, { status: 500 })
  }
}
