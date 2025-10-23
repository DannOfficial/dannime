'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { History as HistoryIcon, Play, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useStore from '@/lib/store';

export default function HistoryPage() {
  const router = useRouter();
  const { user, watchHistory } = useStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const sortedHistory = [...watchHistory].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <HistoryIcon className="mr-3 h-8 w-8 text-blue-500" />
          Watch History
        </h1>
        <p className="text-muted-foreground">
          {watchHistory.length} episode{watchHistory.length !== 1 ? 's' : ''} watched
        </p>
      </div>

      {sortedHistory.length > 0 ? (
        <div className="space-y-4">
          {sortedHistory.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 capitalize">
                      {item.animeSlug.replace(/-/g, ' ')}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Episode: {item.episodeId}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/anime/${item.animeSlug}/episode/${item.episodeId}`}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue Watching
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Watch History</h2>
            <p className="text-muted-foreground mb-6">
              Start watching anime to build your watch history
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
