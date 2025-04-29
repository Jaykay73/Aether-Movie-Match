"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function RecommendationStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    async function checkBackendStatus() {
      try {
        // Simple ping to check if the backend is available
        const response = await fetch("/api/status")
        if (response.ok) {
          setStatus("online")
        } else {
          setStatus("offline")
        }
      } catch (error) {
        setStatus("offline")
      }
    }

    checkBackendStatus()
  }, [])

  if (status === "checking") {
    return null
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
        status === "online" ? "bg-emerald-900/30 text-emerald-400" : "bg-amber-900/30 text-amber-400"
      }`}
    >
      {status === "online" ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          <span>Using personalized recommendations</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Using popular recommendations (backend offline)</span>
        </>
      )}
    </div>
  )
}
