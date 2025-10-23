'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function GenresPage() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/genres');
      const data = await response.json();
      
      if (data.success) {
        setGenres(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch genres');
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Failed to load genres. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse by Genre</h1>
        <p className="text-muted-foreground">Discover anime by your favorite genres</p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchGenres}>Try Again</Button>
        </div>
      )}

      {!loading && !error && genres.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {genres.map((genre, index) => (
            <Link key={`${genre.slug}-${index}`} href={`/genres/${genre.slug}`}>
              <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Film className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold">{genre.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && genres.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No genres available at the moment.</p>
        </div>
      )}
    </div>
  );
}
