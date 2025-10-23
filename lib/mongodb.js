import mongoose from "mongoose"

const MONGO_URL = "mongodb+srv://DanzFav:Danz4477@database.geqksdm.mongodb.net/dannnime?retryWrites=true&w=majority&appName=database"

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (!MONGO_URL) {
    console.warn("MONGO_URL environment variable is not defined. Database features will be unavailable.")
    throw new Error("Please define the MONGO_URL environment variable in your Vercel project settings")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGO_URL, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { connectDB }
export default connectDB
