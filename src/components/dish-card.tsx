import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from '@/lib/distance';

// Accepts both the old mock Dish shape and the new API shape
interface DishCardProps {
  distanceMiles?: number;
  dish: {
    id: string;
    // API shape uses 'title', mock shape uses 'name'
    title?: string;
    name?: string;
    price: number;
    // API shape uses 'imageUrl', mock shape too
    imageUrl?: string | null;
    // API shape has cook.location, mock shape has provider.location
    cook?: {
      id?: string;
      name?: string | null;
      location?: string | null;
      cookProfile?: {
        kitchenName?: string;
        avgRating?: number | null;
      } | null;
    };
    provider?: {
      id?: string;
      name?: string;
      location?: string;
      distance?: string;
    };
    // Review count
    _count?: { reviews: number };
    rating?: number;
    reviewCount?: number;
    // For AI hint on placeholder images
    'data-ai-hint'?: string;
  };
}

export function DishCard({ dish, distanceMiles: distMi }: DishCardProps) {
  const displayName = dish.title ?? dish.name ?? 'Untitled';
  const location =
    dish.cook?.location ?? dish.provider?.location ?? dish.provider?.distance ?? '';
  const imageUrl = dish.imageUrl ?? 'https://placehold.co/600x400.png';
  const rating = dish.cook?.cookProfile?.avgRating ?? dish.rating;
  const reviewCount = dish._count?.reviews ?? dish.reviewCount;

  return (
    <Link href={`/dishes/${dish.id}`} className="block overflow-hidden rounded-lg group">
      <Card className="h-full flex flex-col transition-all duration-200 ease-in-out group-hover:shadow-xl border-0 shadow-none hover:shadow-none">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {distMi !== undefined && (
              <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" />
                {formatDistance(distMi)}
              </div>
            )}
            <Image
              src={imageUrl}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-ai-hint={dish['data-ai-hint'] ?? 'food dish'}
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-grow space-y-1">
          <p className="text-base font-semibold text-foreground">${dish.price.toFixed(2)}</p>
          <p className="text-sm text-foreground truncate font-medium">{displayName}</p>
          {location && (
            <p className="text-xs text-muted-foreground truncate">{location}</p>
          )}
          {rating && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>{rating.toFixed(1)}</span>
              {reviewCount != null && <span>({reviewCount})</span>}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
