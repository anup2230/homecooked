"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { DishCard } from "@/components/dish-card";
import { mockDishes, mockTestimonials } from "@/lib/data";
import { ArrowRight, Star, MapPin, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/discover');
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const featuredDishes = mockDishes.slice(0, 8);

  return (
    <div>
      <section className="relative bg-secondary/50 py-20 md:py-32">
        <div className="container text-center">
           <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight">
            Discover Authentic Homemade Meals
            <br />
            in Your Neighborhood.
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Explore a world of flavors from talented independent cooks in your community.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/discover">Discover Dishes</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
               <Link href="/sell">Become a Cook</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Featured Dishes</h2>
            <Button variant="ghost" asChild>
                <Link href="/discover">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
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
        </div>
      </section>
      
      <section className="bg-background py-16 md:py-24">
        <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-3xl font-bold font-headline">Find Meals Near You</h2>
                    <p className="text-muted-foreground text-lg">Discover talented home cooks in your neighborhood. See who's cooking nearby and enjoy fresh, locally-made food.</p>
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
