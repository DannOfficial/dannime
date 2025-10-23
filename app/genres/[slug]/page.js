'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AnimeCard from '@/components/AnimeCard';
import { AnimeGridSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';

export default function GenreDetailPage() {
  const params = useParams();
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.slug) {
      fetchAnimeByGenre();
    }
  }, [params.slug]);

  const fetchAnimeByGenre = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/genres/${params.slug}`);
      const data = await response.json();
      
      if (data.success) {
        setAnimeList(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch anime');
      }
    } catch (err) {
      console.error('Error fetching anime by genre:', err);
      setError('Failed to load anime. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/genres">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Genres
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2 capitalize">
          {params.slug?.replace(/-/g, ' ')}
        </h1>
        <p className="text-muted-foreground">Anime in this genre</p>
      </div>

      {loading && <AnimeGridSkeleton count={12} />}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchAnimeByGenre}>Try Again</Button>
        </div>
      )}

      {!loading && !error && animeList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {animeList.map((anime, index) => (
            <AnimeCard key={`${anime.slug}-${index}`} anime={anime} />
          ))}
        </div>
      )}

      {!loading && !error && animeList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No anime found in this genre.</p>
        </div>
      )}
    </div>
  );
}
