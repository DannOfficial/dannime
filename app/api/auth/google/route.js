import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  // If no code, redirect to Google OAuth
  if (!code) {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID || "")
    googleAuthUrl.searchParams.set(
      "redirect_uri",
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google`,
    )
    googleAuthUrl.searchParams.set("response_type", "code")
    googleAuthUrl.searchParams.set("scope", "openid email profile")
    googleAuthUrl.searchParams.set("access_type", "offline")
    googleAuthUrl.searchParams.set("prompt", "consent")

    return NextResponse.redirect(googleAuthUrl.toString())
  }

  // Handle OAuth callback
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google`,
        grant_type: "authorization_code",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    const userData = await userResponse.json()

    // TODO: Create or update user in database
    // For now, redirect to home with success message
    const redirectUrl = new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000")
    redirectUrl.searchParams.set("auth", "success")
    redirectUrl.searchParams.set("provider", "google")

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("Google OAuth error:", error)
    const redirectUrl = new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000")
    redirectUrl.searchParams.set("error", "oauth_failed")
    return NextResponse.redirect(redirectUrl.toString())
  }
}
