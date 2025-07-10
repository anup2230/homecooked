
"use client";

import { useState } from 'react';
import { DishCard } from "@/components/dish-card";
import { Button } from '@/components/ui/button';
import { mockDishes } from "@/lib/data";
import type { DeliveryOption } from '@/lib/types';

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
          A Visual Feast
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
          Scroll through a feed of delicious homemade meals from cooks in your community.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </div>
  );
}
