import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"

export const dynamic = "force-dynamic"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  // If no code, redirect to GitHub OAuth
  if (!code) {
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize")
    githubAuthUrl.searchParams.set("client_id", "Ov23li1QizDqw21No79r")
    githubAuthUrl.searchParams.set(
      "redirect_uri",
      "https://dannime.biz.id/api/auth/github",
    )
    githubAuthUrl.searchParams.set("scope", "read:user user:email")

    return NextResponse.redirect(githubAuthUrl.toString())
  }

  // Handle OAuth callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: "Ov23li1QizDqw21No79r",
        client_secret: "5b9acfb6b558a3eae646c2acb415a1bfa4a8a7f5",
        code,
        redirect_uri: "https://dannime.biz.id/api/auth/github",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    })

    const githubUser = await userResponse.json()

    // Get user email if not public
    if (!githubUser.email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/json",
        },
      })
      const emails = await emailResponse.json()
      const primaryEmail = emails.find((email) => email.primary)
      githubUser.email = primaryEmail?.email
    }

    await connectDB()

    let user = await User.findOne({ email: githubUser.email })

    if (!user) {
      // Create new user
      user = await User.create({
        email: githubUser.email,
        username: githubUser.login || githubUser.email.split("@")[0],
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        provider: "github",
        providerId: githubUser.id.toString(),
        verified: true,
      })
    } else {
      // Update existing user
      user.name = githubUser.name || githubUser.login
      user.avatar = githubUser.avatar_url
      user.lastLogin = new Date()
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "dannime", {
      expiresIn: "7d",
    })

    // Create response with redirect
    const redirectUrl = new URL("/", "https://dannime.biz.id")
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
    console.error(error)
    const redirectUrl = new URL("/login", "https://dannime.biz.id")
    redirectUrl.searchParams.set("error", "oauth_failed")
    return NextResponse.redirect(redirectUrl.toString())
  }
}
