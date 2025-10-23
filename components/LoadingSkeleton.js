'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function AnimeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}

export function AnimeGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AnimeDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
