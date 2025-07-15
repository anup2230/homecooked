
"use client";

import { useState } from 'react';
import { DishCard } from "@/components/dish-card";
import { Button } from '@/components/ui/button';
import { mockDishes, mockUsers } from "@/lib/data";
import type { DeliveryOption } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Soup, Pizza, Vegan, Star, ChefHat, Utensils } from 'lucide-react';
import { KitchenResultCard } from '@/components/kitchen-result-card';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'dishes' | 'kitchens'>('dishes');

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

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
    if (searchTerm) {
        const inName = dish.name.toLowerCase().includes(lowerCaseSearchTerm);
        const inKitchen = dish.provider.name.toLowerCase().includes(lowerCaseSearchTerm);
        if (!inName && !inKitchen) {
            return false;
        }
    }
    return true;
  });

  const allProviders = mockUsers.filter(u => u.isProvider);

  const filteredProviders = allProviders.filter(provider => {
    if (searchTerm) {
      return provider.name.toLowerCase().includes(lowerCaseSearchTerm);
    }
    return true; // Show all providers if no search term
  });


  const handleLocationSelect = (address: string) => {
    setAddress(address);
  };

  const showDishes = searchMode === 'dishes';
  const showKitchens = searchMode === 'kitchens';

  const displayedDishes = showDishes ? filteredDishes : [];
  const displayedProviders = showKitchens ? filteredProviders : [];

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
                    placeholder="Search by dish or kitchen..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <Button 
                    variant={searchMode === 'dishes' ? 'secondary' : 'ghost'} 
                    onClick={() => setSearchMode('dishes')}
                    className="w-full justify-center"
                >
                    <Utensils className="mr-2 h-4 w-4"/>
                    Dishes
                </Button>
                <Button 
                    variant={searchMode === 'kitchens' ? 'secondary' : 'ghost'} 
                    onClick={() => setSearchMode('kitchens')}
                    className="w-full justify-center"
                >
                    <ChefHat className="mr-2 h-4 w-4"/>
                    Kitchens
                </Button>
            </div>
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
                    disabled={showKitchens}
                />
                 <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(e.target.value)} 
                    aria-label="Maximum price"
                    disabled={showKitchens}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery method</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Checkbox id="pickup" checked={deliveryFilter === 'pickup' || deliveryFilter === 'all'} onCheckedChange={() => setDeliveryFilter(deliveryFilter === 'pickup' ? 'all' : 'pickup')} disabled={showKitchens}/>
                    <Label htmlFor="pickup">Pickup</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="dropoff" checked={deliveryFilter === 'drop-off' || deliveryFilter === 'all'} onCheckedChange={() => setDeliveryFilter(deliveryFilter === 'drop-off' ? 'all' : 'drop-off')} disabled={showKitchens} />
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
                        <Button key={cat.id} variant="ghost" className="w-full justify-start" disabled={showKitchens}>
                            <Icon className="mr-2 h-5 w-5"/>
                            {cat.name}
                        </Button>
                    );
                })}
             </div>
          </div>
        </div>
      </aside>

      {/* Results */}
      <main className="col-span-1 md:col-span-3">
        <ScrollArea className="h-[calc(100vh-8rem)]">
            {showDishes && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                    {displayedDishes.map((dish) => (
                        <DishCard key={dish.id} dish={dish} />
                    ))}
                </div>
            )}
             {showKitchens && (
                <div className="space-y-8">
                  {displayedProviders.length > 0 ? (
                      displayedProviders.map((provider) => (
                        <KitchenResultCard 
                            key={provider.id} 
                            provider={provider} 
                            dishes={mockDishes.filter(dish => dish.provider.id === provider.id)}
                        />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No kitchens found for "{searchTerm}". Try a different search.</p>
                    </div>
                  )}
                </div>
            )}
        </ScrollArea>
      </main>
    </div>
  );
}
