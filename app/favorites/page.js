'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnimeCard from '@/components/AnimeCard';
import { AnimeGridSkeleton } from '@/components/LoadingSkeleton';
import { toast } from 'sonner';
import useStore from '@/lib/store';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, favorites, removeFavorite } = useStore();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchFavorites();
  }, [user, favorites]);

  const fetchFavorites = async () => {
    if (!user || favorites.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const promises = favorites.map(slug =>
        fetch(`/api/anime/detail/${slug}`)
          .then(res => res.json())
          .then(data => data.success ? data.data : null)
          .catch(() => null)
      );
      
      const results = await Promise.all(promises);
      setAnimeList(results.filter(anime => anime !== null));
    } catch (err) {
      console.error('Error fetching favorites:', err);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (slug) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, animeSlug: slug })
      });
      
      if (response.ok) {
        removeFavorite(slug);
        toast.success('Removed from favorites');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove favorite');
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Heart className="mr-3 h-8 w-8 text-red-500" />
              My Favorites
            </h1>
            <p className="text-muted-foreground">
              {favorites.length} anime in your favorites
            </p>
          </div>
        </div>
      </div>

      {loading && <AnimeGridSkeleton count={favorites.length || 12} />}

      {!loading && animeList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {animeList.map((anime) => (
            <div key={anime.slug} className="relative group">
              <AnimeCard anime={anime} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(anime.slug);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Favorites Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding anime to your favorites to see them here
            </p>
            <Button asChild>
              <a href="/">Browse Anime</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
