
"use client";

import { useState } from 'react';
import { DishCard } from "@/components/dish-card";
import { Button } from '@/components/ui/button';
import { mockDishes } from "@/lib/data";
import type { DeliveryOption } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Bell, PlusCircle, Soup, Pizza, Vegan, Star } from 'lucide-react';

const categories = [
    { id: 'italian', name: 'Italian', icon: Pizza },
    { id: 'chinese', name: 'Chinese', icon: Soup },
    { id: 'vegan', name: 'Vegan', icon: Vegan },
    { id: 'dessert', name: 'Dessert', icon: Star },
];

export default function DiscoverPage() {
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryOption | 'all'>('all');
  const [address, setAddress] = useState("San Francisco, California");
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('food');

  const filteredDishes = mockDishes.filter(dish => {
    if (deliveryFilter !== 'all' && !dish.deliveryOptions?.includes(deliveryFilter)) {
        return false;
    }
    if (minPrice && dish.price < parseFloat(minPrice)) {
        return false;
    }
    if (maxPrice && dish.price > parseFloat(maxPrice)) {
        return false;
    }
    if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm !== 'food') {
      return false;
    }
    return true;
  });

  const handleLocationSelect = (address: string) => {
    setAddress(address);
  };

  return (
    <div className="container mx-auto py-6 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
      {/* Sidebar */}
      <aside className="col-span-1 md:sticky md:top-20">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Search results</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="food" 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" className="w-full mt-2 justify-start text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                <Bell className="mr-2"/> Notify Me
            </Button>
            <Button variant="outline" className="w-full mt-2 justify-start text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                <PlusCircle className="mr-2"/> Create new listing
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Filters</h3>
            <LocationAutocomplete 
              value={address} 
              onChange={setAddress} 
              onSelect={handleLocationSelect} 
            />
          </div>

          <Accordion type="multiple" defaultValue={['sort', 'price', 'delivery']} className="w-full">
            <AccordionItem value="sort">
              <AccordionTrigger>Sort by</AccordionTrigger>
              <AccordionContent>
                <Select defaultValue="best_match">
                    <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="best_match">Best match</SelectItem>
                        <SelectItem value="price_asc">Price: low to high</SelectItem>
                        <SelectItem value="price_desc">Price: high to low</SelectItem>
                        <SelectItem value="newest">Newest listed</SelectItem>
                    </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="price">
              <AccordionTrigger>Price</AccordionTrigger>
              <AccordionContent className="flex gap-2">
                 <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={e => setMinPrice(e.target.value)} 
                    aria-label="Minimum price"
                />
                 <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(e.target.value)} 
                    aria-label="Maximum price"
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery method</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="pickup" checked={deliveryFilter === 'pickup' || deliveryFilter === 'all'} onCheckedChange={() => setDeliveryFilter(deliveryFilter === 'pickup' ? 'all' : 'pickup')}/>
                    <Label htmlFor="pickup">Pickup</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="dropoff" checked={deliveryFilter === 'drop-off' || deliveryFilter === 'all'} onCheckedChange={() => setDeliveryFilter(deliveryFilter === 'drop-off' ? 'all' : 'drop-off')} />
                    <Label htmlFor="dropoff">Drop-off</Label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div>
             <h3 className="font-semibold mb-2">Categories</h3>
             <div className="space-y-2">
                {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                        <Button key={cat.id} variant="ghost" className="w-full justify-start">
                            <Icon className="mr-2 h-5 w-5"/>
                            {cat.name}
                        </Button>
                    );
                })}
             </div>
          </div>
        </div>
      </aside>

      {/* Dish Grid */}
      <main className="col-span-1 md:col-span-3">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
            {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
