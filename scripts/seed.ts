import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log("Starting database seed...")

    // Create a demo user
    const hashedPassword = await hash("password123", 10)

    const demoUser = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        name: "Demo User",
        email: "demo@example.com",
        password: hashedPassword,
      },
    })

    console.log(`Created demo user: ${demoUser.name} (${demoUser.email})`)

    // Create a watchlist for the demo user
    const watchlist = await prisma.watchlist.upsert({
      where: { userId: demoUser.id },
      update: {},
      create: {
        userId: demoUser.id,
      },
    })

    console.log(`Created watchlist for demo user`)

    // Add some sample movies to the watchlist
    const sampleMovies = [
      { movieId: "299534", tmdbId: "299534" }, // Avengers: Endgame
      { movieId: "299536", tmdbId: "299536" }, // Avengers: Infinity War
      { movieId: "1726", tmdbId: "1726" }, // Iron Man
    ]

    for (const movie of sampleMovies) {
      await prisma.watchlistMovie.upsert({
        where: {
          watchlistId_movieId: {
            watchlistId: watchlist.id,
            movieId: movie.movieId,
          },
        },
        update: {},
        create: {
          watchlistId: watchlist.id,
          movieId: movie.movieId,
          tmdbId: movie.tmdbId,
        },
      })
    }

    console.log(`Added ${sampleMovies.length} movies to demo user's watchlist`)

    // Add some sample preferences
    const samplePreferences = [
      { movieId: "24428", tmdbId: "24428" }, // The Avengers
      { movieId: "299537", tmdbId: "299537" }, // Captain Marvel
      { movieId: "284053", tmdbId: "284053" }, // Thor: Ragnarok
      { movieId: "118340", tmdbId: "118340" }, // Guardians of the Galaxy
      { movieId: "10138", tmdbId: "10138" }, // Iron Man 2
    ]

    for (const pref of samplePreferences) {
      await prisma.preference.upsert({
        where: {
          userId_movieId: {
            userId: demoUser.id,
            movieId: pref.movieId,
          },
        },
        update: {},
        create: {
          userId: demoUser.id,
          movieId: pref.movieId,
          tmdbId: pref.tmdbId,
        },
      })
    }

    console.log(`Added ${samplePreferences.length} preferences for demo user`)

    // Add some liked/disliked movies
    const likedMovies = [
      { movieId: "315635", tmdbId: "315635", isLiked: true }, // Spider-Man: Homecoming
      { movieId: "99861", tmdbId: "99861", isLiked: true }, // Avengers: Age of Ultron
      { movieId: "271110", tmdbId: "271110", isLiked: true }, // Captain America: Civil War
      { movieId: "10195", tmdbId: "10195", isLiked: false }, // Thor
      { movieId: "1771", tmdbId: "1771", isLiked: false }, // Captain America: The First Avenger
    ]

    for (const movie of likedMovies) {
      await prisma.likedMovie.upsert({
        where: {
          userId_movieId: {
            userId: demoUser.id,
            movieId: movie.movieId,
          },
        },
        update: {},
        create: {
          userId: demoUser.id,
          movieId: movie.movieId,
          tmdbId: movie.tmdbId,
          isLiked: movie.isLiked,
        },
      })
    }

    console.log(`Added ${likedMovies.length} liked/disliked movies for demo user`)

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
