
"use client";

import { useState } from 'react';
import { DishCard } from "@/components/dish-card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockDishes } from "@/lib/data";
import type { DeliveryOption } from '@/lib/types';
import { MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DiscoverPage() {
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryOption | 'all'>('all');

  const filteredDishes = mockDishes.filter(dish => {
    if (deliveryFilter === 'all') return true;
    return dish.deliveryOptions?.includes(deliveryFilter);
  });

  return (
    <div className="container py-10 flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="text-center mb-8 shrink-0">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
          A Visual Feast
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
          Scroll through a feed of delicious homemade meals from cooks in your community.
        </p>
      </div>
      
      <div className="max-w-xl mx-auto mb-4 w-full shrink-0">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter your address, neighborhood, or zip code"
            className="pl-10 h-12 text-base"
          />
          <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-10">
            Find Food
          </Button>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mb-8 shrink-0">
        <div className="flex gap-2">
            <Button
              variant={deliveryFilter === 'all' ? 'outline' : 'ghost'}
              className="h-9"
              onClick={() => setDeliveryFilter('all')}
            >
              All
            </Button>
            <Button
              variant={deliveryFilter === 'pickup' ? 'outline' : 'ghost'}
              className="h-9"
              onClick={() => setDeliveryFilter('pickup')}
            >
              Pickup
            </Button>
            <Button
              variant={deliveryFilter === 'drop-off' ? 'outline' : 'ghost'}
              className="h-9"
              onClick={() => setDeliveryFilter('drop-off')}
            >
              Drop-off
            </Button>
        </div>
      </div>

       <ScrollArea className="flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 pb-10">
          {filteredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
