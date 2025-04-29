import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/db"

// Get user's preferences
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        preferences: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ preferences: user.preferences })
  } catch (error) {
    console.error("Error fetching preferences:", error)
    return NextResponse.json({ message: "An error occurred while fetching preferences" }, { status: 500 })
  }
}

// Save user preferences
export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { movieIds } = await request.json()

    if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return NextResponse.json({ message: "Missing or invalid movieIds" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Clear existing preferences
    await prisma.preference.deleteMany({
      where: {
        userId: user.id,
      },
    })

    // Add new preferences
    const preferences = await Promise.all(
      movieIds.map(async ({ movieId, tmdbId }) => {
        return prisma.preference.create({
          data: {
            userId: user.id,
            movieId,
            tmdbId,
          },
        })
      }),
    )

    return NextResponse.json({ message: "Preferences saved", preferences })
  } catch (error) {
    console.error("Error saving preferences:", error)
    return NextResponse.json({ message: "An error occurred while saving preferences" }, { status: 500 })
  }
}
