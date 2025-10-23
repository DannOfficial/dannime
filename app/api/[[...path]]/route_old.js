import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Comment from '@/lib/models/Comment';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import {
  getLatestAnime,
  getAnimeDetail,
  getEpisodeLinks,
  searchAnime,
  getGenres,
  getAnimeByGenre
} from '@/lib/scraper/otakudesu';

// Helper function to parse path
function parsePath(request, params) {
  const url = new URL(request.url);
  const pathParts = params?.path || [];
  return {
    path: pathParts,
    query: Object.fromEntries(url.searchParams)
  };
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }));
}

// GET handler
async function handleGET(request, { params }) {
  try {
    const { path, query } = parsePath(request, params);

    // Root endpoint
    if (path.length === 0 || path[0] === '') {
      return handleCORS(NextResponse.json({ message: 'DannNime API', version: '1.0' }));
    }

    // Anime routes
    if (path[0] === 'anime') {
      // Get latest anime
      if (path[1] === 'latest') {
        const anime = await getLatestAnime();
        return handleCORS(NextResponse.json({ success: true, data: anime }));
      }

      // Get anime detail
      if (path[1] === 'detail' && path[2]) {
        const anime = await getAnimeDetail(path[2]);
        return handleCORS(NextResponse.json({ success: true, data: anime }));
      }

      // Search anime
      if (path[1] === 'search') {
        const q = query.q || '';
        if (!q) {
          return handleCORS(NextResponse.json({ success: false, error: 'Search query required' }, { status: 400 }));
        }
        const results = await searchAnime(q);
        return handleCORS(NextResponse.json({ success: true, data: results }));
      }

      // Get episode links
      if (path[1] === 'episode' && path[2]) {
        const episode = await getEpisodeLinks(path[2]);
        return handleCORS(NextResponse.json({ success: true, data: episode }));
      }
    }

    // Genres routes
    if (path[0] === 'genres') {
      if (!path[1]) {
        const genres = await getGenres();
        return handleCORS(NextResponse.json({ success: true, data: genres }));
      }
      
      // Get anime by genre
      const animeList = await getAnimeByGenre(path[1]);
      return handleCORS(NextResponse.json({ success: true, data: animeList }));
    }

    // Categories route (alias for genres)
    if (path[0] === 'categories') {
      const genres = await getGenres();
      return handleCORS(NextResponse.json({ success: true, data: genres }));
    }

    // User routes
    if (path[0] === 'user') {
      await connectDB();

      // Get user profile
      if (path[1] === 'profile' && query.email) {
        const user = await User.findOne({ email: query.email }).select('-password');
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }));
        }
        return handleCORS(NextResponse.json({ success: true, data: user }));
      }

      // Get user favorites
      if (path[1] === 'favorites' && query.userId) {
        const user = await User.findOne({ id: query.userId });
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }));
        }
        return handleCORS(NextResponse.json({ success: true, data: user.favorites || [] }));
      }

      // Get user watch history
      if (path[1] === 'history' && query.userId) {
        const user = await User.findOne({ id: query.userId });
        if (!user) {
          return handleCORS(NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }));
        }
        return handleCORS(NextResponse.json({ success: true, data: user.watchHistory || [] }));
      }
    }

    // Comments routes
    if (path[0] === 'comments') {
      await connectDB();

      if (query.animeSlug) {
        const comments = await Comment.find({ animeSlug: query.animeSlug }).sort({ createdAt: -1 });
        return handleCORS(NextResponse.json({ success: true, data: comments }));
      }
    }

    return handleCORS(NextResponse.json({ success: false, error: 'Not found' }, { status: 404 }));
  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

// POST handler
async function handlePOST(request, { params }) {
  try {
    const { path } = parsePath(request, params);
    const body = await request.json();

    await connectDB();

    // User registration
    if (path[0] === 'auth' && path[1] === 'register') {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return handleCORS(NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 }));
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return handleCORS(NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 }));
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        provider: 'credentials',
        emailVerified: false
      });

      return handleCORS(NextResponse.json({ 
        success: true, 
        data: { id: user.id, name: user.name, email: user.email } 
      }));
    }

    // User login
    if (path[0] === 'auth' && path[1] === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return handleCORS(NextResponse.json({ success: false, error: 'Email and password required' }, { status: 400 }));
      }

      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return handleCORS(NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 }));
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return handleCORS(NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 }));
      }

      return handleCORS(NextResponse.json({ 
        success: true, 
        data: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          image: user.image 
        } 
      }));
    }

    // Add to favorites
    if (path[0] === 'user' && path[1] === 'favorites') {
      const { userId, animeSlug } = body;

      if (!userId || !animeSlug) {
        return handleCORS(NextResponse.json({ success: false, error: 'User ID and anime slug required' }, { status: 400 }));
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        return handleCORS(NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }));
      }

      if (!user.favorites) user.favorites = [];
      
      if (user.favorites.includes(animeSlug)) {
        return handleCORS(NextResponse.json({ success: false, error: 'Already in favorites' }, { status: 400 }));
      }

      user.favorites.push(animeSlug);
      await user.save();

      return handleCORS(NextResponse.json({ success: true, data: user.favorites }));
    }

    // Add watch history
    if (path[0] === 'user' && path[1] === 'history') {
      const { userId, animeSlug, episodeId, progress } = body;

      if (!userId || !animeSlug || !episodeId) {
        return handleCORS(NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 }));
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        return handleCORS(NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }));
      }

      if (!user.watchHistory) user.watchHistory = [];

      // Update or add to history
      const existingIndex = user.watchHistory.findIndex(
        h => h.animeSlug === animeSlug && h.episodeId === episodeId
      );

      if (existingIndex >= 0) {
        user.watchHistory[existingIndex].timestamp = new Date();
        user.watchHistory[existingIndex].progress = progress || 0;
      } else {
        user.watchHistory.push({
          animeSlug,
          episodeId,
          timestamp: new Date(),
          progress: progress || 0
        });
      }

      await user.save();

      return handleCORS(NextResponse.json({ success: true, data: user.watchHistory }));
    }

    // Add comment
    if (path[0] === 'comments') {
      const { animeSlug, userId, userName, userImage, text } = body;

      if (!animeSlug || !userId || !userName || !text) {
        return handleCORS(NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 }));
      }

      const comment = await Comment.create({
        id: uuidv4(),
        animeSlug,
        userId,
        userName,
        userImage: userImage || '',
        text
      });

      return handleCORS(NextResponse.json({ success: true, data: comment }));
    }

    return handleCORS(NextResponse.json({ success: false, error: 'Not found' }, { status: 404 }));
  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

// DELETE handler
async function handleDELETE(request, { params }) {
  try {
    const { path } = parsePath(request, params);
    const body = await request.json();

    await connectDB();

    // Remove from favorites
    if (path[0] === 'user' && path[1] === 'favorites') {
      const { userId, animeSlug } = body;

      if (!userId || !animeSlug) {
        return handleCORS(NextResponse.json({ success: false, error: 'User ID and anime slug required' }, { status: 400 }));
      }

      const user = await User.findOne({ id: userId });
      if (!user) {
        return handleCORS(NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }));
      }

      user.favorites = user.favorites.filter(slug => slug !== animeSlug);
      await user.save();

      return handleCORS(NextResponse.json({ success: true, data: user.favorites }));
    }

    return handleCORS(NextResponse.json({ success: false, error: 'Not found' }, { status: 404 }));
  } catch (error) {
    console.error('API Error:', error);
    return handleCORS(NextResponse.json({ success: false, error: error.message }, { status: 500 }));
  }
}

// Export all HTTP methods
export const GET = handleGET;
export const POST = handlePOST;
export const DELETE = handleDELETE;
export const PUT = handlePOST;
export const PATCH = handlePOST;
