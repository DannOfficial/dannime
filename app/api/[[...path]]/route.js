import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Comment from "@/lib/models/Comment"
import OTP from "@/lib/models/OTP"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcryptjs"
import {
  getLatestAnime,
  getAnimeDetail,
  getEpisodeLinks,
  searchAnime,
  getGenres,
  getAnimeByGenre,
} from "@/lib/scraper/otakudesu"
import { addXPAndRecalculate, getUserLevelStats, XP_CONFIG } from "@/lib/xpSystem"
import { generateOTP, sendOTPEmail, sendBroadcastEmail, sendLevelUpEmail } from "@/lib/email"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Helper function to parse path
async function parsePath(request, params) {
  const url = new URL(request.url)
  const resolvedParams = await params
  const pathParts = resolvedParams?.path || []
  return {
    path: pathParts,
    query: Object.fromEntries(url.searchParams),
  }
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set("Access-Control-Allow-Origin", process.env.CORS_ORIGINS || "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// GET handler
async function handleGET(request, { params }) {
  try {
    const { path, query } = await parsePath(request, params)

    // Root endpoint
    if (path.length === 0 || path[0] === "") {
      return handleCORS(NextResponse.json({ message: "DannNime API", version: "2.0" }))
    }

    // Anime routes
    if (path[0] === "anime") {
      // Get anime detail
      if (path[1] === "detail" && path[2]) {
        const anime = await getAnimeDetail(path[2])
        return handleCORS(NextResponse.json({ success: true, data: anime }))
      }

      // Search anime or get all latest if no query
      if (path[1] === "search") {
        const q = query.q || ""
        if (!q) {
          const anime = await getLatestAnime()
          return handleCORS(NextResponse.json({ success: true, data: anime }))
        }
        const results = await searchAnime(q)
        return handleCORS(NextResponse.json({ success: true, data: results }))
      }

      // Get episode links
      if (path[1] === "episode" && path[2]) {
        try {
          const episode = await getEpisodeLinks(path[2])
          return handleCORS(NextResponse.json({ success: true, data: episode }))
        } catch (error) {
          return handleCORS(
            NextResponse.json({ success: false, error: "Failed to fetch episode links" }, { status: 500 }),
          )
        }
      }

      // Get latest anime (default route when no sub-path)
      if (!path[1] || path[1] === "latest") {
        const anime = await getLatestAnime()
        return handleCORS(NextResponse.json({ success: true, data: anime }))
      }
    }

    // Genres routes
    if (path[0] === "genres") {
      if (!path[1]) {
        const genres = await getGenres()
        return handleCORS(NextResponse.json({ success: true, data: genres }))
      }

      // Get anime by genre
      const animeList = await getAnimeByGenre(path[1])
      return handleCORS(NextResponse.json({ success: true, data: animeList }))
    }

    // Categories route (alias for genres)
    if (path[0] === "categories") {
      const genres = await getGenres()
      return handleCORS(NextResponse.json({ success: true, data: genres }))
    }

    // User routes
    if (path[0] === "user") {
      await connectDB()

      // Get user profile
      if (path[1] === "profile" && query.email) {
        const user = await User.findOne({ email: query.email }).select("-password")
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }

        // Add level stats
        const levelStats = getUserLevelStats(user)
        return handleCORS(
          NextResponse.json({
            success: true,
            data: {
              ...user.toObject(),
              levelStats,
            },
          }),
        )
      }

      // Get user by ID
      if (path[1] === "profile" && query.userId) {
        const user = await User.findOne({ id: query.userId }).select("-password")
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }

        const levelStats = getUserLevelStats(user)
        return handleCORS(
          NextResponse.json({
            success: true,
            data: {
              ...user.toObject(),
              levelStats,
            },
          }),
        )
      }

      // Get user favorites
      if (path[1] === "favorites" && query.userId) {
        const user = await User.findOne({ id: query.userId })
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }
        return handleCORS(NextResponse.json({ success: true, data: user.favorites || [] }))
      }

      // Get user watch history
      if (path[1] === "history" && query.userId) {
        const user = await User.findOne({ id: query.userId })
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }
        return handleCORS(NextResponse.json({ success: true, data: user.watchHistory || [] }))
      }
    }

    // Comments routes
    if (path[0] === "comments") {
      await connectDB()

      if (query.animeSlug) {
        const comments = await Comment.find({ animeSlug: query.animeSlug }).sort({ createdAt: -1 })
        return handleCORS(NextResponse.json({ success: true, data: comments }))
      }
    }

    // Admin routes
    if (path[0] === "admin") {
      await connectDB()

      // Check admin authorization
      const userId = query.adminId || request.headers.get("x-user-id")
      if (!userId) {
        return handleCORS(NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }))
      }

      const admin = await User.findOne({ id: userId })
      if (!admin || !admin.isAdmin) {
        return handleCORS(NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 }))
      }

      // Get all users
      if (path[1] === "users") {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 })
        const usersWithStats = users.map((user) => ({
          ...user.toObject(),
          levelStats: getUserLevelStats(user),
        }))
        return handleCORS(NextResponse.json({ success: true, data: usersWithStats }))
      }

      // Get statistics
      if (path[1] === "stats") {
        const totalUsers = await User.countDocuments()
        const totalComments = await Comment.countDocuments()

        // Calculate total episodes watched
        const users = await User.find({})
        const totalEpisodesWatched = users.reduce((total, user) => {
          return total + (user.watchHistory?.length || 0)
        }, 0)

        // Role distribution
        const roleDistribution = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])

        // Recent users
        const recentUsers = await User.find({}).select("-password").sort({ createdAt: -1 }).limit(5)

        return handleCORS(
          NextResponse.json({
            success: true,
            data: {
              totalUsers,
              totalComments,
              totalEpisodesWatched,
              roleDistribution,
              recentUsers,
            },
          }),
        )
      }
    }

    return handleCORS(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }))
  } catch (error) {
    console.error("API Error:", error)
    return handleCORS(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
  }
}

// POST handler
async function handlePOST(request, { params }) {
  try {
    const { path } = await parsePath(request, params)
    const body = await request.json()

    await connectDB()

    // Auth routes
    if (path[0] === "auth") {
      // User registration
      if (path[1] === "register") {
        const { name, email, password } = body

        if (!name || !email || !password) {
          return handleCORS(NextResponse.json({ success: false, error: "All fields required" }, { status: 400 }))
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return handleCORS(NextResponse.json({ success: false, error: "User already exists" }, { status: 400 }))
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
          id: uuidv4(),
          name,
          email,
          password: hashedPassword,
          provider: "credentials",
          emailVerified: false,
          xp: 0,
          level: 1,
          role: "Bronze",
          isAdmin: email === "admin@example.com", // First admin
        })

        return handleCORS(
          NextResponse.json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
            },
          }),
        )
      }

      // Send OTP
      if (path[1] === "send-otp") {
        const { email } = body

        if (!email) {
          return handleCORS(NextResponse.json({ success: false, error: "Email required" }, { status: 400 }))
        }

        const user = await User.findOne({ email })
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }

        if (user.emailVerified) {
          return handleCORS(NextResponse.json({ success: false, error: "Email already verified" }, { status: 400 }))
        }

        // Generate OTP
        const otp = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Delete existing OTPs for this email
        await OTP.deleteMany({ email })

        // Save new OTP
        await OTP.create({ email, otp, expiresAt })

        // Send email
        try {
          await sendOTPEmail(email, otp, user.name)
          return handleCORS(
            NextResponse.json({
              success: true,
              message: "OTP sent to your email",
            }),
          )
        } catch (emailError) {
          console.error("Email error:", emailError)
          return handleCORS(
            NextResponse.json(
              {
                success: false,
                error: "Failed to send OTP. Please ensure SMTP credentials are configured.",
              },
              { status: 500 },
            ),
          )
        }
      }

      // Verify OTP
      if (path[1] === "verify-otp") {
        const { email, otp } = body

        if (!email || !otp) {
          return handleCORS(NextResponse.json({ success: false, error: "Email and OTP required" }, { status: 400 }))
        }

        const otpRecord = await OTP.findOne({ email, otp, verified: false })

        if (!otpRecord) {
          return handleCORS(NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 400 }))
        }

        if (new Date() > otpRecord.expiresAt) {
          await OTP.deleteOne({ _id: otpRecord._id })
          return handleCORS(NextResponse.json({ success: false, error: "OTP expired" }, { status: 400 }))
        }

        // Mark OTP as verified
        otpRecord.verified = true
        await otpRecord.save()

        // Update user email verification
        await User.findOneAndUpdate({ email }, { emailVerified: true })

        return handleCORS(
          NextResponse.json({
            success: true,
            message: "Email verified successfully",
          }),
        )
      }

      // User login
      if (path[1] === "login") {
        const { email, password } = body

        if (!email || !password) {
          return handleCORS(
            NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 }),
          )
        }

        const user = await User.findOne({ email })
        if (!user || !user.password) {
          return handleCORS(NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 }))
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return handleCORS(NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 }))
        }

        const levelStats = getUserLevelStats(user)

        return handleCORS(
          NextResponse.json({
            success: true,
            data: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              emailVerified: user.emailVerified,
              xp: user.xp,
              level: user.level,
              role: user.role,
              isAdmin: user.isAdmin,
              levelStats,
            },
          }),
        )
      }
    }

    // User routes
    if (path[0] === "user") {
      // Add to favorites
      if (path[1] === "favorites") {
        const { userId, animeSlug } = body

        if (!userId || !animeSlug) {
          return handleCORS(
            NextResponse.json({ success: false, error: "User ID and anime slug required" }, { status: 400 }),
          )
        }

        const user = await User.findOne({ id: userId })
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }

        if (!user.favorites) user.favorites = []

        if (user.favorites.includes(animeSlug)) {
          return handleCORS(NextResponse.json({ success: false, error: "Already in favorites" }, { status: 400 }))
        }

        user.favorites.push(animeSlug)
        await user.save()

        return handleCORS(NextResponse.json({ success: true, data: user.favorites }))
      }

      // Add watch history with XP gain
      if (path[1] === "history") {
        const { userId, animeSlug, episodeId, progress } = body

        if (!userId || !animeSlug || !episodeId) {
          return handleCORS(NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 }))
        }

        const user = await User.findOne({ id: userId })
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }

        if (!user.watchHistory) user.watchHistory = []

        // Check if episode already watched
        const existingIndex = user.watchHistory.findIndex((h) => h.animeSlug === animeSlug && h.episodeId === episodeId)

        let xpGained = 0
        let leveledUp = false
        let previousLevel = user.level

        if (existingIndex >= 0) {
          // Update existing history
          user.watchHistory[existingIndex].timestamp = new Date()
          user.watchHistory[existingIndex].progress = progress || 0
        } else {
          // New episode watched - add XP
          const xpResult = addXPAndRecalculate(user, XP_CONFIG.XP_PER_EPISODE)
          user.xp = xpResult.xp
          user.level = xpResult.level
          user.role = xpResult.role
          xpGained = xpResult.xpGained
          leveledUp = xpResult.leveledUp
          previousLevel = xpResult.previousLevel

          // Add to history
          user.watchHistory.push({
            animeSlug,
            episodeId,
            timestamp: new Date(),
            progress: progress || 0,
          })

          // Send level-up email if leveled up
          if (leveledUp) {
            try {
              await sendLevelUpEmail(user.email, user.name, user.level, user.role)
            } catch (error) {
              console.error("Failed to send level-up email:", error)
            }
          }
        }

        await user.save()

        const levelStats = getUserLevelStats(user)

        return handleCORS(
          NextResponse.json({
            success: true,
            data: {
              watchHistory: user.watchHistory,
              xp: user.xp,
              level: user.level,
              role: user.role,
              xpGained,
              leveledUp,
              previousLevel,
              levelStats,
            },
          }),
        )
      }
    }

    // Comments routes
    if (path[0] === "comments") {
      const { animeSlug, userId, userName, userImage, text } = body

      if (!animeSlug || !userId || !userName || !text) {
        return handleCORS(NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 }))
      }

      const comment = await Comment.create({
        id: uuidv4(),
        animeSlug,
        userId,
        userName,
        userImage: userImage || "",
        text,
      })

      return handleCORS(NextResponse.json({ success: true, data: comment }))
    }

    // Admin routes
    if (path[0] === "admin") {
      // Verify admin
      const userId = body.adminId || request.headers.get("x-user-id")
      if (!userId) {
        return handleCORS(NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }))
      }

      const admin = await User.findOne({ id: userId })
      if (!admin || !admin.isAdmin) {
        return handleCORS(NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 }))
      }

      // Broadcast email
      if (path[1] === "broadcast") {
        const { subject, message } = body

        if (!subject || !message) {
          return handleCORS(
            NextResponse.json({ success: false, error: "Subject and message required" }, { status: 400 }),
          )
        }

        // Get all user emails
        const users = await User.find({ emailVerified: true }).select("email")
        const emails = users.map((u) => u.email)

        if (emails.length === 0) {
          return handleCORS(
            NextResponse.json({ success: false, error: "No verified users to send email" }, { status: 400 }),
          )
        }

        try {
          await sendBroadcastEmail(emails, subject, message)
          return handleCORS(
            NextResponse.json({
              success: true,
              message: `Email sent to ${emails.length} users`,
            }),
          )
        } catch (error) {
          console.error("Broadcast email error:", error)
          return handleCORS(
            NextResponse.json(
              {
                success: false,
                error: "Failed to send broadcast email. Please ensure SMTP credentials are configured.",
              },
              { status: 500 },
            ),
          )
        }
      }

      // Update user
      if (path[1] === "update-user") {
        const { targetUserId, updates } = body

        if (!targetUserId) {
          return handleCORS(NextResponse.json({ success: false, error: "User ID required" }, { status: 400 }))
        }

        const user = await User.findOneAndUpdate({ id: targetUserId }, { $set: updates }, { new: true }).select(
          "-password",
        )

        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
        }

        return handleCORS(NextResponse.json({ success: true, data: user }))
      }

      // Delete user
      if (path[1] === "delete-user") {
        const { targetUserId } = body

        if (!targetUserId) {
          return handleCORS(NextResponse.json({ success: false, error: "User ID required" }, { status: 400 }))
        }

        // Prevent deleting own account
        if (targetUserId === userId) {
          return handleCORS(
            NextResponse.json({ success: false, error: "Cannot delete your own account" }, { status: 400 }),
          )
        }

        await User.findOneAndDelete({ id: targetUserId })
        return handleCORS(NextResponse.json({ success: true, message: "User deleted" }))
      }
    }

    return handleCORS(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }))
  } catch (error) {
    console.error("API Error:", error)
    return handleCORS(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
  }
}

// DELETE handler
async function handleDELETE(request, { params }) {
  try {
    const { path } = await parsePath(request, params)
    const body = await request.json()

    await connectDB()

    // Remove from favorites
    if (path[0] === "user" && path[1] === "favorites") {
      const { userId, animeSlug } = body

      if (!userId || !animeSlug) {
        return handleCORS(
          NextResponse.json({ success: false, error: "User ID and anime slug required" }, { status: 400 }),
        )
      }

      const user = await User.findOne({ id: userId })
      if (!user) {
        return handleCORS(NextResponse.json({ success: false, error: "User not found" }, { status: 404 }))
      }

      user.favorites = user.favorites.filter((slug) => slug !== animeSlug)
      await user.save()

      return handleCORS(NextResponse.json({ success: true, data: user.favorites }))
    }

    return handleCORS(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }))
  } catch (error) {
    console.error("API Error:", error)
    return handleCORS(NextResponse.json({ success: false, error: error.message }, { status: 500 }))
  }
}

// Export all HTTP methods
export const GET = handleGET
export const POST = handlePOST
export const DELETE = handleDELETE
export const PUT = handlePOST
export const PATCH = handlePOST
