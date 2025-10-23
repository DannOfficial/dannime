import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getUserLevelStats } from "@/lib/xpSystem"

export const dynamic = "force-dynamic"

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user has a password (OAuth users don't)
    if (!user.password) {
      return NextResponse.json({ success: false, error: "Please login with your OAuth provider" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ success: false, error: "Please verify your email before logging in" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || "dannime",
      {
        expiresIn: "7d",
      },
    )

    const levelStats = getUserLevelStats(user)

    // Create response
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        level: user.level,
        xp: user.xp,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        favorites: user.favorites || [],
        watchHistory: user.watchHistory || [],
        levelStats,
      },
    })

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
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "An error occurred during login" }, { status: 500 })
  }
}
