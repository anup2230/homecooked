"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Star, Instagram, ShoppingBag, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface KitchenPage {
  id: string;
  name: string | null;
  image: string | null;
  location: string | null;
  cookProfile: {
    kitchenName: string;
    description: string | null;
    isVerified: boolean;
    avgRating: number | null;
    totalOrders: number;
    cuisineTags: string[];
    acceptsOrders: boolean;
    instagramHandle: string | null;
  } | null;
  dishesCreated: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    category: string | null;
    _count: { reviews: number };
  }[];
}

export default function KitchenLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [kitchen, setKitchen] = useState<KitchenPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(r => r.json())
      .then(data => setKitchen(data.user))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!kitchen || kitchen.cookProfile === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-muted-foreground">Kitchen not found.</p>
        <Button asChild variant="outline"><Link href="/discover">Browse all kitchens</Link></Button>
      </div>
    );
  }

  const profile = kitchen.cookProfile;
  const instagramHandle = profile.instagramHandle?.replace('@', '');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="relative h-56 w-full bg-gradient-to-br from-primary/30 to-secondary/50 overflow-hidden">
        {kitchen.dishesCreated[0]?.imageUrl && (
          <Image
            src={kitchen.dishesCreated[0].imageUrl}
            alt={profile.kitchenName}
            fill
            className="object-cover opacity-30"
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container max-w-2xl -mt-16 pb-16 space-y-8">
        {/* Kitchen header */}
        <div className="text-center space-y-3">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl mx-auto">
            <AvatarImage src={kitchen.image ?? undefined} alt={profile.kitchenName} />
            <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
              {profile.kitchenName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-headline">{profile.kitchenName}</h1>
              {profile.isVerified && (
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
              )}
            </div>
            {kitchen.location && (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" /> {kitchen.location}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            {profile.avgRating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{profile.avgRating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <ShoppingBag className="h-4 w-4" />
              <span>{profile.totalOrders} orders</span>
            </div>
          </div>

          {/* Cuisine tags */}
          {profile.cuisineTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {profile.cuisineTags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          {profile.description && (
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              {profile.description}
            </p>
          )}

          {/* Status */}
          {!profile.acceptsOrders && (
            <Badge variant="destructive">Not currently accepting orders</Badge>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full text-base" disabled={!profile.acceptsOrders}>
            <Link href={`/profile/${id}`}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Order from {profile.kitchenName}
            </Link>
          </Button>

          {instagramHandle && (
            <Button asChild size="lg" variant="outline" className="w-full text-base">
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5 text-pink-500" />
                @{instagramHandle} on Instagram
              </a>
            </Button>
          )}

          <Button asChild variant="ghost" className="w-full text-sm text-muted-foreground">
            <Link href="/discover">
              Browse all kitchens on Homecooked
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Separator />

        {/* Dish grid */}
        {kitchen.dishesCreated.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Menu</h2>
            <div className="grid grid-cols-2 gap-3">
              {kitchen.dishesCreated.map(dish => (
                <Link
                  key={dish.id}
                  href={`/dishes/${dish.id}`}
                  className="group rounded-xl overflow-hidden border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <Image
                      src={dish.imageUrl ?? 'https://placehold.co/400x400.png'}
                      alt={dish.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-3 space-y-0.5">
                    <p className="font-semibold text-sm truncate">{dish.title}</p>
                    <p className="text-primary font-bold text-sm">${dish.price.toFixed(2)}</p>
                    {dish._count.reviews > 0 && (
                      <p className="text-xs text-muted-foreground">{dish._count.reviews} reviews</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Homecooked footer */}
        <div className="text-center pt-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Powered by <span className="font-semibold text-primary">Homecooked</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
