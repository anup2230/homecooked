
"use client";

import { useState } from 'react';
import { DishCard } from "@/components/dish-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { mockDishes } from "@/lib/data";
import type { DeliveryOption } from '@/lib/types';

const categories = [
    'Italian',
    'Mexican',
    'Japanese',
    'Indian',
    'Chinese',
    'American',
    'Salad',
    'Dessert',
];

export default function DiscoverPage() {
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryOption | 'all'>('all');

  const filteredDishes = mockDishes.filter(dish => {
    if (deliveryFilter === 'all') return true;
    return dish.deliveryOptions?.includes(deliveryFilter);
  });

  return (
    <div className="container py-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
          Discover Your Next Favorite Meal
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
          Explore a world of flavors from talented independent cooks in your community.
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-12">
        <Button
          variant={deliveryFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setDeliveryFilter('all')}
        >
          All Dishes
        </Button>
        <Button
          variant={deliveryFilter === 'pickup' ? 'default' : 'outline'}
          onClick={() => setDeliveryFilter('pickup')}
        >
          Pickup
        </Button>
        <Button
          variant={deliveryFilter === 'drop-off' ? 'default' : 'outline'}
          onClick={() => setDeliveryFilter('drop-off')}
        >
          Drop-off
        </Button>
      </div>

      <div className="space-y-12">
        {categories.map((category) => {
            const dishesForCategory = filteredDishes.filter(dish => dish.category === category);
            if (dishesForCategory.length === 0) return null;

            return (
                <section key={category}>
                    <h2 className="text-3xl font-bold font-headline mb-6">{category} Dishes</h2>
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {dishesForCategory.map((dish) => (
                                <CarouselItem key={dish.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="h-full">
                                        <DishCard dish={dish} />
                                    </div>
                                </CarouselItem>
                            ))}
        
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>
                </section>
            );
        })}
      </div>
    </div>
  );
}
