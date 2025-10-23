import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Not required for OAuth users
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      default: "credentials",
      enum: ["credentials", "google", "github"],
    },
    providerId: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // XP and Leveling System
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    role: {
      type: String,
      default: "Bronze",
      enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
    },
    // Admin System
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favorites: [
      {
        type: String,
      },
    ],
    watchHistory: [
      {
        animeSlug: String,
        episodeId: String,
        timestamp: Date,
        progress: Number,
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

UserSchema.index({ email: 1 })
UserSchema.index({ id: 1 })
UserSchema.index({ providerId: 1 })

export default mongoose.models.User || mongoose.model("User", UserSchema)
