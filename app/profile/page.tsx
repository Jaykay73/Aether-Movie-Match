"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [watchlistCount, setWatchlistCount] = useState(0)
  const [preferencesCount, setPreferencesCount] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      fetchUserStats()
    }
  }, [status, router])

  const fetchUserStats = async () => {
    try {
      // Fetch watchlist
      const watchlistResponse = await fetch("/api/watchlist")
      if (watchlistResponse.ok) {
        const data = await watchlistResponse.json()
        setWatchlistCount(data.watchlist?.movies?.length || 0)
      }

      // Fetch preferences
      const preferencesResponse = await fetch("/api/preferences")
      if (preferencesResponse.ok) {
        const data = await preferencesResponse.json()
        setPreferencesCount(data.preferences?.length || 0)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  if (status === "loading" || !session) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback className="text-2xl">
                    {session.user?.name
                      ? session.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <CardTitle className="text-2xl">{session.user?.name}</CardTitle>
                  <CardDescription>{session.user?.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="account" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                  </TabsList>
                  <TabsContent value="account" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p>{session.user?.name || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p>{session.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Account Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => router.push("/watchlist")}>
                          Manage Watchlist
                        </Button>
                        <Button variant="outline" onClick={() => router.push("/preferences")}>
                          Manage Preferences
                        </Button>
                        <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="stats" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Watchlist</CardTitle>
                          <CardDescription>Movies you want to watch</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold">{watchlistCount}</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" onClick={() => router.push("/watchlist")}>
                            View Watchlist
                          </Button>
                        </CardFooter>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Preferences</CardTitle>
                          <CardDescription>Movies that influence your recommendations</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-4xl font-bold">{preferencesCount}</p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" onClick={() => router.push("/preferences")}>
                            View Preferences
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
