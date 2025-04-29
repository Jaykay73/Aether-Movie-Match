// This file provides fallback recommendations when the backend is temporarily unavailable

// Popular movie IDs that can be used as fallback recommendations
const POPULAR_MOVIE_IDS = [
  "299534", // Avengers: Endgame
  "299536", // Avengers: Infinity War
  "1726", // Iron Man
  "24428", // The Avengers
  "299537", // Captain Marvel
  "284053", // Thor: Ragnarok
  "118340", // Guardians of the Galaxy
  "10138", // Iron Man 2
  "315635", // Spider-Man: Homecoming
  "99861", // Avengers: Age of Ultron
  "271110", // Captain America: Civil War
  "10195", // Thor
  "1771", // Captain America: The First Avenger
  "102899", // Ant-Man
  "284054", // Black Panther
  "283995", // Guardians of the Galaxy Vol. 2
  "76338", // Thor: The Dark World
  "68721", // Iron Man 3
  "363088", // Ant-Man and the Wasp
  "429617", // Spider-Man: Far From Home
]

// Return a subset of popular movies as fallback recommendations
export function getFallbackRecommendations(excludeIds: string[] = []): string[] {
  // Filter out any excluded IDs
  const availableMovies = POPULAR_MOVIE_IDS.filter((id) => !excludeIds.includes(id))

  // Shuffle the array to get different recommendations each time
  const shuffled = [...availableMovies].sort(() => 0.5 - Math.random())

  // Return 10 random movie IDs
  return shuffled.slice(0, 10)
}
