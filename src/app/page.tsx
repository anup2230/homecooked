"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { DishCard } from "@/components/dish-card";
import { mockTestimonials } from "@/lib/data";
import { ArrowRight, Star, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface FeaturedDish {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  cook: {
    id: string;
    name: string | null;
    location: string | null;
    cookProfile: { kitchenName: string; avgRating: number | null } | null;
  };
  _count: { reviews: number };
}

export default function HomePage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [featuredDishes, setFeaturedDishes] = useState<FeaturedDish[]>([]);
  const [dishesLoading, setDishesLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/discover');
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    // Fetch featured dishes from the real API
    fetch('/api/dishes?limit=8')
      .then(r => r.json())
      .then(data => setFeaturedDishes(data.dishes ?? []))
      .catch(() => setFeaturedDishes([]))
      .finally(() => setDishesLoading(false));
  }, []);

  // Show spinner while auth state resolves (prevents flash)
  if (isLoading || isLoggedIn) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-secondary/50 py-20 md:py-32 overflow-hidden">
        {/* Floating food emojis */}
        <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="absolute text-4xl animate-float delay-0"   style={{top:'12%', left:'6%'}}>🍜</span>
          <span className="absolute text-3xl animate-float delay-500" style={{top:'20%', left:'18%'}}>✨</span>
          <span className="absolute text-4xl animate-float-slow delay-300" style={{top:'8%', right:'10%'}}>🥘</span>
          <span className="absolute text-3xl animate-float delay-700" style={{top:'55%', left:'4%'}}>🌿</span>
          <span className="absolute text-4xl animate-float-slow delay-1000" style={{top:'70%', right:'6%'}}>🍱</span>
          <span className="absolute text-3xl animate-float delay-1500" style={{top:'30%', right:'20%'}}>⭐</span>
          <span className="absolute text-4xl animate-float delay-2000" style={{bottom:'15%', left:'14%'}}>🫙</span>
          <span className="absolute text-3xl animate-float-slow delay-2500" style={{bottom:'20%', right:'16%'}}>🥗</span>
        </div>

        <div className="container text-center relative z-10">
          {/* Chef mascot */}
          <div className="flex justify-center mb-6">
            <div className="animate-bounce-in">
              <div className="relative inline-block">
                <div className="text-8xl animate-wiggle cursor-default select-none" title="Hi! I'm Cooky 👋">
                  👨‍🍳
                </div>
                <div className="absolute -top-2 -right-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow animate-bounce">
                  Hi! 👋
                </div>
              </div>
            </div>
          </div>

          <h1 className="animate-fade-up opacity-0 delay-200 text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight">
            Discover Authentic Homemade Meals
            <br />
            in Your Neighborhood.
          </h1>
          <p className="animate-fade-up opacity-0 delay-300 mt-6 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Explore a world of flavors from talented independent cooks in your community.
          </p>
          <div className="animate-fade-up opacity-0 delay-500 mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/discover">Discover Dishes</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sell">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Dishes — real data */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline animate-fade-up">Featured Dishes</h2>
            <Button variant="ghost" asChild>
              <Link href="/discover">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {dishesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : featuredDishes.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No dishes yet — be the first to</p>
              <Button asChild variant="link" className="mt-1">
                <Link href="/sell">list your food</Link>
              </Button>
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent>
                {featuredDishes.map((dish) => (
                  <CarouselItem key={dish.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1">
                      <DishCard dish={dish} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          )}
        </div>
      </section>

      {/* Map CTA */}
      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-bold font-headline">Find Meals Near You</h2>
              <p className="text-muted-foreground text-lg">
                Discover talented home cooks in your neighborhood. See who&apos;s cooking nearby and enjoy fresh, locally-made food.
              </p>
              <Button asChild>
                <Link href="/map">
                  <MapPin className="mr-2 h-4 w-4" />
                  Explore Local Map
                </Link>
              </Button>
            </div>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border">
              <Image
                src="https://placehold.co/800x450.png"
                alt="Map showing nearby cooks"
                fill
                className="object-cover"
                data-ai-hint="map city"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — kept from mock (real reviews require users) */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">What Our Customers Are Saying</h2>
            <p className="mt-2 text-lg text-muted-foreground">Real stories from real food lovers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">&quot;{testimonial.comment}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
