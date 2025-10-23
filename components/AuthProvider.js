"use client"

import { useEffect } from "react"
import useStore from "@/lib/store"

export default function AuthProvider({ children }) {
  const { setUser, user } = useStore()

  useEffect(() => {
    // Only fetch user if not already loaded
    if (!user) {
      fetchUser()
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.data)
        }
      }
    } catch (error) {
      // Silently fail - user is not logged in
      console.log("[v0] Not authenticated")
    }
  }

  return <>{children}</>
}
