import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
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
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    default: 'credentials',
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
    default: 'Bronze',
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
  },
  // Admin System
  isAdmin: {
    type: Boolean,
    default: false,
  },
  favorites: [{
    type: String,
  }],
  watchHistory: [{
    animeSlug: String,
    episodeId: String,
    timestamp: Date,
    progress: Number,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
