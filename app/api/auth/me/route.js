import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"

export const dynamic = "force-dynamic"

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Get user from database
    await connectDB()
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        level: user.level,
        xp: user.xp,
        favorites: user.favorites,
        watchHistory: user.watchHistory,
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
  }
}
