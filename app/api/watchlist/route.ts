import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"

// Get user's watchlist
export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        watchlist: {
          include: {
            movies: true,
          },
        },
      },
    })

    if (!user || !user.watchlist) {
      return NextResponse.json({ message: "Watchlist not found" }, { status: 404 })
    }

    return NextResponse.json({ watchlist: user.watchlist })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ message: "An error occurred while fetching watchlist" }, { status: 500 })
  }
}
