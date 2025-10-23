'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Play, Heart, Calendar, Star, Clock, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AnimeDetailSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';
import useStore from '@/lib/store';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, favorites, addFavorite, removeFavorite } = useStore();

  const isFavorite = favorites.includes(params.slug);

  useEffect(() => {
    if (params.slug) {
      fetchAnimeDetail();
    }
  }, [params.slug]);

  const fetchAnimeDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/anime/detail/${params.slug}`);
      const data = await response.json();
      
      if (data.success) {
        setAnime(data.data);
      } else {
        setError(data.error || 'Failed to fetch anime details');
      }
    } catch (err) {
      console.error('Error fetching anime detail:', err);
      setError('Failed to load anime. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        const response = await fetch('/api/user/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, animeSlug: params.slug })
        });
        
        if (response.ok) {
          removeFavorite(params.slug);
          toast.success('Removed from favorites');
        }
      } else {
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, animeSlug: params.slug })
        });
        
        if (response.ok) {
          addFavorite(params.slug);
          toast.success('Added to favorites');
        }
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error('Failed to update favorites');
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-8"><AnimeDetailSkeleton /></div>;
  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchAnimeDetail}>Try Again</Button>
      </div>
    </div>
  );
  if (!anime) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={anime.image}
                  alt={anime.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <Button className="w-full" size="lg" onClick={handleToggleFavorite}>
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{anime.title}</h1>
              
              {anime.genres && anime.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {anime.genres.map((genre, index) => (
                    <Badge key={index} variant="secondary">{genre}</Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {anime.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{anime.rating}</span>
                  </div>
                )}
                {anime.status && (
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    <span>{anime.status}</span>
                  </div>
                )}
                {anime.totalEpisodes && (
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>{anime.totalEpisodes}</span>
                  </div>
                )}
                {anime.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{anime.duration}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Synopsis */}
            {anime.synopsis && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{anime.synopsis}</p>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {anime.type && (
                <div>
                  <span className="font-semibold">Type:</span> {anime.type}
                </div>
              )}
              {anime.studio && (
                <div>
                  <span className="font-semibold">Studio:</span> {anime.studio}
                </div>
              )}
              {anime.releaseDate && (
                <div>
                  <span className="font-semibold">Release Date:</span> {anime.releaseDate}
                </div>
              )}
              {anime.producer && (
                <div>
                  <span className="font-semibold">Producer:</span> {anime.producer}
                </div>
              )}
            </div>

            <Separator />

            {/* Episodes */}
            {anime.episodes && anime.episodes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Episodes</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {anime.episodes.map((episode, index) => (
                    <Link key={index} href={`/anime/${params.slug}/episode/${episode.slug}`}>
                      <Button variant="outline" className="w-full">
                        <Play className="mr-2 h-3 w-3" />
                        {episode.title}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
