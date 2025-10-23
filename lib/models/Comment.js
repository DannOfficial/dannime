import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  animeSlug: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
