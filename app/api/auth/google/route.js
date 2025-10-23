import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  // If no code, redirect to Google OAuth
  if (!code) {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.set("client_id", "393016557815-dov797ghjaavmm9as74g17ichq889l8u.apps.googleusercontent.com")
    googleAuthUrl.searchParams.set(
      "redirect_uri",
      "https://dannime.biz.id/api/auth/google",
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
        client_id: "393016557815-dov797ghjaavmm9as74g17ichq889l8u.apps.googleusercontent.com",
        client_secret: "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",
        redirect_uri: "https://dannime.biz.id/api/auth/google",
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
        id: uuidv4(),
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split("@")[0],
        image: googleUser.picture,
        provider: "google",
        providerId: googleUser.id,
        emailVerified: true,
        xp: 0,
        level: 1,
        role: "Bronze",
        isAdmin: false,
        lastLogin: new Date(),
      })
    } else {
      user.name = googleUser.name || user.name
      user.image = googleUser.picture
      user.lastLogin = new Date()
      if (!user.providerId && user.provider === "google") {
        user.providerId = googleUser.id
      }
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, "dannime", {
      expiresIn: "7d",
    })

    const redirectUrl = new URL("/", "https://dannime.biz.id")
    const response = NextResponse.redirect(redirectUrl.toString())

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error(error)
    const redirectUrl = new URL("/login", "https://dannime.biz.id")
    redirectUrl.searchParams.set("error", "oauth_failed")
    return NextResponse.redirect(redirectUrl.toString())
  }
}
