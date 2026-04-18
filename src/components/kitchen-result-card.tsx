import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Instagram, ExternalLink, CheckCircle } from 'lucide-react';

interface KitchenDish {
  id: string;
  title?: string;
  name?: string;
  price: number;
  imageUrl?: string | null;
}

interface KitchenCook {
  id: string;
  name?: string | null;
  image?: string | null;
  location?: string | null;
  cookProfile?: {
    kitchenName?: string;
    description?: string | null;
    avgRating?: number | null;
    isVerified?: boolean;
    totalOrders?: number;
    cuisineTags?: string[];
    instagramHandle?: string | null;
  } | null;
}

interface KitchenResultCardProps {
  cook: KitchenCook;
  dishes: KitchenDish[];
}

export function KitchenResultCard({ cook, dishes }: KitchenResultCardProps) {
  const profile = cook.cookProfile;
  const kitchenName = profile?.kitchenName ?? cook.name ?? 'Unknown Kitchen';
  const previewDishes = dishes.slice(0, 4);

  return (
    <div className="border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Banner — first dish image as hero, or gradient fallback */}
      <div className="relative h-36 w-full bg-gradient-to-br from-primary/20 to-secondary/40">
        {previewDishes[0]?.imageUrl && (
          <Image
            src={previewDishes[0].imageUrl}
            alt={kitchenName}
            fill
            className="object-cover opacity-40"
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

        {/* Verified badge */}
        {profile?.isVerified && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <CheckCircle className="h-3 w-3" /> Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Kitchen info */}
      <div className="px-5 pb-5">
        {/* Avatar overlapping banner */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <Avatar className="h-16 w-16 border-4 border-card shadow-md">
            <AvatarImage src={cook.image ?? undefined} alt={kitchenName} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {kitchenName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2 items-center">
            {profile?.instagramHandle && (
              <a
                href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-pink-500 transition-colors"
                title={`@${profile.instagramHandle.replace('@', '')} on Instagram`}
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href={`/profile/${cook.id}`}>
                View Kitchen <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg leading-tight">{kitchenName}</h3>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {cook.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {cook.location}
              </span>
            )}
            {profile?.avgRating && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                {profile.avgRating.toFixed(1)}
                {profile.totalOrders ? ` · ${profile.totalOrders} orders` : ''}
              </span>
            )}
          </div>

          {profile?.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{profile.description}</p>
          )}

          {profile?.cuisineTags && profile.cuisineTags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap pt-1">
              {profile.cuisineTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Dish grid — fixed square images */}
        {previewDishes.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {previewDishes.map(dish => (
              <Link
                key={dish.id}
                href={`/dishes/${dish.id}`}
                className="group relative"
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={dish.imageUrl ?? 'https://placehold.co/200x200.png'}
                    alt={dish.title ?? dish.name ?? ''}
                    fill
                    sizes="120px"
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <p className="text-xs mt-1 font-medium truncate text-foreground">
                  {dish.title ?? dish.name}
                </p>
                <p className="text-xs text-muted-foreground">${dish.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No dishes listed yet.</p>
        )}
      </div>
    </div>
  );
}
