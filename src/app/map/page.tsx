"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DishCard } from "@/components/dish-card";
import { MapPin, Star, Search, Loader2, ShoppingBag, CheckCircle } from "lucide-react";
import { useDebounce } from '@/hooks/use-debounce';

interface CookWithDishes {
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
  } | null;
  dishes: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    category: string | null;
    _count: { reviews: number };
  }[];
}

export default function MapPage() {
  const [cooks, setCooks] = useState<CookWithDishes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    async function fetchCooks() {
      setIsLoading(true);
      try {
        // Fetch dishes grouped by cook
        const params = new URLSearchParams({ limit: '60' });
        if (debouncedSearch) params.set('search', debouncedSearch);

        const res = await fetch(`/api/dishes?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // Group dishes by cook
        const cookMap = new Map<string, CookWithDishes>();
        (data.dishes ?? []).forEach((dish: any) => {
          const cookId = dish.cook.id;
          if (!cookMap.has(cookId)) {
            cookMap.set(cookId, {
              id: cookId,
              name: dish.cook.name,
              image: dish.cook.image,
              location: dish.cook.location,
              cookProfile: dish.cook.cookProfile,
              dishes: [],
            });
          }
          cookMap.get(cookId)!.dishes.push({
            id: dish.id,
            title: dish.title,
            price: dish.price,
            imageUrl: dish.imageUrl,
            category: dish.category,
            _count: dish._count,
          });
        });

        setCooks(Array.from(cookMap.values()));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCooks();
  }, [debouncedSearch]);

  const activeCooks = cooks.filter(c => c.cookProfile?.acceptsOrders !== false);

  return (
    <div className="bg-background">
      {/* Hero banner */}
      <section className="relative h-72 bg-muted">
        <Image
          src="https://placehold.co/1600x400.png"
          alt="Map of the city"
          fill
          className="object-cover"
          data-ai-hint="city map aerial"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative container h-full flex flex-col justify-end pb-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold font-headline tracking-tight">
              Cooks in Your Neighborhood
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Browse home cooks by location and discover hidden culinary gems right around the corner.
            </p>
          </div>
        </div>
      </section>

      {/* Search + stats bar */}
      <div className="border-b bg-background/95 sticky top-14 z-40 backdrop-blur">
        <div className="container py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cooks or dishes..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {!isLoading && (
            <p className="text-sm text-muted-foreground shrink-0">
              {activeCooks.length} cook{activeCooks.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      </div>

      {/* Cook listings */}
      <section className="container py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : cooks.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">
              {debouncedSearch
                ? `No cooks found for "${debouncedSearch}"`
                : 'No cooks listed yet.'}
            </p>
            {!debouncedSearch && (
              <Button asChild className="mt-4">
                <Link href="/sell">Be the first cook!</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-14">
            {cooks.map(cook => (
              <div key={cook.id} className="space-y-5">
                {/* Cook header */}
                <div className="flex items-start gap-4">
                  <Link href={`/profile/${cook.id}`} className="shrink-0">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={cook.image ?? undefined} alt={cook.name ?? 'Cook'} />
                      <AvatarFallback className="text-xl font-bold">
                        {cook.name?.charAt(0) ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/profile/${cook.id}`}
                        className="text-2xl font-bold font-headline hover:underline truncate"
                      >
                        {cook.cookProfile?.kitchenName ?? cook.name}
                      </Link>
                      {cook.cookProfile?.isVerified && (
                        <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                          <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </Badge>
                      )}
                      {cook.cookProfile?.acceptsOrders === false && (
                        <Badge variant="destructive" className="shrink-0">Not accepting orders</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                      {cook.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {cook.location}
                        </span>
                      )}
                      {cook.cookProfile?.avgRating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {cook.cookProfile.avgRating.toFixed(1)}
                        </span>
                      )}
                      {cook.cookProfile?.totalOrders != null && cook.cookProfile.totalOrders > 0 && (
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3.5 w-3.5" />
                          {cook.cookProfile.totalOrders} orders
                        </span>
                      )}
                    </div>

                    {cook.cookProfile?.cuisineTags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {cook.cookProfile.cuisineTags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {cook.cookProfile?.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {cook.cookProfile.description}
                      </p>
                    )}
                  </div>

                  <Button asChild variant="outline" size="sm" className="shrink-0 hidden sm:flex">
                    <Link href={`/profile/${cook.id}`}>View Kitchen</Link>
                  </Button>
                </div>

                {/* Dishes */}
                {cook.dishes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {cook.dishes.slice(0, 5).map(dish => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                    {cook.dishes.length > 5 && (
                      <Link
                        href={`/profile/${cook.id}`}
                        className="flex items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors aspect-square text-sm font-medium"
                      >
                        +{cook.dishes.length - 5} more
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic pl-20">
                    No dishes listed at the moment.
                  </p>
                )}

                <div className="border-b" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
