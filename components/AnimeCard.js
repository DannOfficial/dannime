'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnimeCard({ anime }) {
  return (
    <Link href={`/anime/${anime.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={anime.image}
            alt={anime.title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary rounded-full p-4">
              <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
            </div>
          </div>
          {anime.episode && (
            <Badge className="absolute top-2 left-2 bg-primary">
              {anime.episode}
            </Badge>
          )}
          {anime.status && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              {anime.status}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 text-sm mb-2 min-h-[2.5rem]">
            {anime.title}
          </h3>
          {anime.rating && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              {anime.rating}
            </div>
          )}
          {anime.day && (
            <div className="text-xs text-muted-foreground mt-1">
              {anime.day}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
