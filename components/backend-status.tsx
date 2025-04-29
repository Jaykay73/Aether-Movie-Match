"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    async function checkBackendStatus() {
      try {
        // Simple ping to check if the backend is available
        const response = await fetch("/api/status")
        if (response.ok) {
          const data = await response.json()
          setStatus(data.status)
        } else {
          setStatus("offline")
        }
      } catch (error) {
        setStatus("offline")
      }
    }

    checkBackendStatus()

    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000)

    return () => clearInterval(interval)
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
          <span>Using Render backend for recommendations</span>
        </>
      ) : (
        <>
          <AlertCircle className="w-4 h-4" />
          <span>Using fallback recommendations (backend offline)</span>
        </>
      )}
    </div>
  )
}
