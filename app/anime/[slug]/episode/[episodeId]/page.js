'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import useStore from '@/lib/store';

export default function EpisodePage() {
  const params = useParams();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const { user, addToHistory } = useStore();

  useEffect(() => {
    if (params.episodeId) {
      fetchEpisode();
    }
  }, [params.episodeId]);

  useEffect(() => {
    if (episode && user) {
      // Save to watch history
      addToHistory({
        animeSlug: params.slug,
        episodeId: params.episodeId,
        timestamp: new Date(),
        progress: 0
      });

      // Also save to backend
      fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          animeSlug: params.slug,
          episodeId: params.episodeId,
          progress: 0
        })
      }).catch(err => console.error('Failed to save history:', err));
    }
  }, [episode, user]);

  const fetchEpisode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/anime/episode/${params.episodeId}`);
      const data = await response.json();
      
      if (data.success) {
        setEpisode(data.data);
        if (data.data.streaming && data.data.streaming.length > 0) {
          setSelectedStream(data.data.streaming[0]);
        }
      } else {
        setError(data.error || 'Failed to fetch episode');
      }
    } catch (err) {
      console.error('Error fetching episode:', err);
      setError('Failed to load episode. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="aspect-video w-full rounded-lg mb-8" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchEpisode}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!episode) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={`/anime/${params.slug}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Anime
        </Link>
      </Button>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">{episode.title}</h1>

      {/* Video Player */}
      <Card className="mb-8">
        <CardContent className="p-0">
          {selectedStream ? (
            <div className="aspect-video w-full bg-black rounded-t-lg overflow-hidden">
              <iframe
                src={selectedStream.url}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-lg">
              <p className="text-muted-foreground">No streaming link available</p>
            </div>
          )}
          
          {/* Stream Quality Selector */}
          {episode.streaming && episode.streaming.length > 0 && (
            <div className="p-4 border-t">
              <p className="text-sm font-medium mb-2">Select Quality:</p>
              <div className="flex flex-wrap gap-2">
                {episode.streaming.map((stream, index) => (
                  <Button
                    key={index}
                    variant={selectedStream?.quality === stream.quality ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <Play className="mr-2 h-3 w-3" />
                    {stream.quality}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Links */}
      {episode.download && episode.download.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-5 w-5" />
              Download Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {episode.download.map((downloadOption, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-2">{downloadOption.quality}</h3>
                  <div className="flex flex-wrap gap-2">
                    {downloadOption.links.map((link, linkIndex) => (
                      <Button
                        key={linkIndex}
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-3 w-3" />
                          {link.host}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
