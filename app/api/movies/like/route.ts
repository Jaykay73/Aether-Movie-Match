import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { movieId, tmdbId, isLiked } = await request.json()

    if (!movieId || !tmdbId || isLiked === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if movie is already liked/disliked
    const existingLike = await prisma.likedMovie.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    })

    if (existingLike) {
      // Update existing like/dislike
      const updatedLike = await prisma.likedMovie.update({
        where: {
          id: existingLike.id,
        },
        data: {
          isLiked,
        },
      })
      return NextResponse.json({ message: "Movie preference updated", likedMovie: updatedLike })
    }

    // Create new like/dislike
    const likedMovie = await prisma.likedMovie.create({
      data: {
        userId: user.id,
        movieId,
        tmdbId,
        isLiked,
      },
    })

    return NextResponse.json({ message: "Movie preference saved", likedMovie })
  } catch (error) {
    console.error("Error saving movie preference:", error)
    return NextResponse.json({ message: "An error occurred while saving movie preference" }, { status: 500 })
  }
}
