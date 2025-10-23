import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import User from "@/lib/models/User"
import jwt from "jsonwebtoken"
import { getUserLevelStats } from "@/lib/xpSystem"

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

    const levelStats = getUserLevelStats(user)

    return NextResponse.json({
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
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
  }
}
