import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

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

    const googleUser = await userResponse.json()

    await connectDB()

    let user = await User.findOne({ email: googleUser.email })

    if (!user) {
      // Create new user
      user = await User.create({
        email: googleUser.email,
        username: googleUser.name || googleUser.email.split("@")[0],
        name: googleUser.name,
        avatar: googleUser.picture,
        provider: "google",
        providerId: googleUser.id,
        verified: true,
      })
    } else {
      // Update existing user
      user.name = googleUser.name
      user.avatar = googleUser.picture
      user.lastLogin = new Date()
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    // Create response with redirect
    const redirectUrl = new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000")
    const response = NextResponse.redirect(redirectUrl.toString())

    // Set token as HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Google OAuth error:", error)
    const redirectUrl = new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000")
    redirectUrl.searchParams.set("error", "oauth_failed")
    return NextResponse.redirect(redirectUrl.toString())
  }
}
