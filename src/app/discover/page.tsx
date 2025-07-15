
"use client";

import { useState } from 'react';
import { DishCard } from "@/components/dish-card";
import { Button } from '@/components/ui/button';
import { mockDishes } from "@/lib/data";
import type { DeliveryOption } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocationAutocomplete } from '@/components/location-autocomplete';

export default function DiscoverPage() {
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryOption | 'all'>('all');
  const [address, setAddress] = useState("");

  const filteredDishes = mockDishes.filter(dish => {
    if (deliveryFilter === 'all') return true;
    return dish.deliveryOptions?.includes(deliveryFilter);
  });

  const handleLocationSelect = (address: string) => {
    setAddress(address);
    console.log("Selected Address: ", address);
    // You can now use this address to filter dishes or pan a map.
  };

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
        <LocationAutocomplete 
          value={address} 
          onChange={setAddress} 
          onSelect={handleLocationSelect} 
        />
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
