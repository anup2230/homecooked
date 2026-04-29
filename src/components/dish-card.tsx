import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        isVerified?: boolean;
      } | null;
    advanceNoticeHrs?: number;
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
  const advanceNoticeHrs = (dish as any).advanceNoticeHrs;
  const cookId = dish.cook?.id;
  const cookImage = (dish.cook as any)?.image ?? null;
  const kitchenName = dish.cook?.cookProfile?.kitchenName ?? dish.cook?.name ?? null;

  return (
    <Link href={`/dishes/${dish.id}`} className="block overflow-hidden rounded-lg group">
      <Card className="h-full flex flex-col transition-all duration-200 ease-in-out group-hover:shadow-xl border-0 shadow-none hover:shadow-none">
        <CardHeader className="p-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
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
          <div className="flex items-center gap-2">
            {cookId && (
              <div onClick={e => e.preventDefault()}>
                <Link href={`/kitchen/${cookId}`}>
                  <Avatar className="h-6 w-6 border border-border shadow-sm hover:scale-110 transition-transform">
                    <AvatarImage src={cookImage} alt={kitchenName ?? 'Cook'} />
                    <AvatarFallback className="text-[10px] bg-primary/80 text-white font-bold">
                      {(kitchenName ?? 'C').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            )}
            {advanceNoticeHrs > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {advanceNoticeHrs < 24 ? `${advanceNoticeHrs}h notice` : `${Math.round(advanceNoticeHrs / 24)}d notice`}
              </span>
            )}
            {distMi !== undefined && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground ml-auto">
                <Navigation className="h-3 w-3" />
                {formatDistance(distMi)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
