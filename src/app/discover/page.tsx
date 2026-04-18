"use client";

import { useState, useEffect, useCallback } from 'react';
import { DishCard } from "@/components/dish-card";
import { Button } from '@/components/ui/button';
import type { DeliveryOption, ServiceType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Soup, Pizza, Vegan, Star, ChefHat, Utensils, PartyPopper, Box, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const categories = [
  { id: 'italian', name: 'Italian', icon: Pizza },
  { id: 'chinese', name: 'Chinese', icon: Soup },
  { id: 'vegan', name: 'Vegan', icon: Vegan },
  { id: 'dessert', name: 'Dessert', icon: Star },
];

interface ApiDish {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  serviceType: string;
  deliveryOptions: string[];
  dietary: string[];
  cook: {
    id: string;
    name: string | null;
    image: string | null;
    location: string | null;
    cookProfile: {
      kitchenName: string;
      avgRating: number | null;
      isVerified: boolean;
    } | null;
  };
  _count: { reviews: number };
}

export default function DiscoverPage() {
  const [deliveryFilter, setDeliveryFilter] = useState<'PICKUP' | 'DROP_OFF' | 'all'>('all');
  const [address, setAddress] = useState("San Francisco, California");
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'dishes' | 'kitchens'>('dishes');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>(['prepped', 'catering']);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 400);
  const debouncedMin = useDebounce(minPrice, 600);
  const debouncedMax = useDebounce(maxPrice, 600);

  const fetchDishes = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory) params.set('category', selectedCategory);
    if (deliveryFilter !== 'all') params.set('delivery', deliveryFilter);
    if (debouncedMin) params.set('minPrice', debouncedMin);
    if (debouncedMax) params.set('maxPrice', debouncedMax);
    // Map service type filter
    if (serviceTypes.length === 1) {
      params.set('serviceType', serviceTypes[0].toUpperCase());
    }
    params.set('limit', '40');

    try {
      const res = await fetch(`/api/dishes?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch dishes');
      const data = await res.json();
      setDishes(data.dishes || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load dishes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedCategory, deliveryFilter, debouncedMin, debouncedMax, serviceTypes]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const handleServiceTypeChange = (serviceType: ServiceType) => {
    setServiceTypes(prev =>
      prev.includes(serviceType)
        ? prev.filter(st => st !== serviceType)
        : [...prev, serviceType]
    );
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(prev => prev === catId ? '' : catId);
  };

  // Group dishes by cook for kitchen view
  const cookMap = new Map<string, { cook: ApiDish['cook']; dishes: ApiDish[] }>();
  dishes.forEach(dish => {
    const existing = cookMap.get(dish.cook.id);
    if (existing) {
      existing.dishes.push(dish);
    } else {
      cookMap.set(dish.cook.id, { cook: dish.cook, dishes: [dish] });
    }
  });
  const cookGroups = Array.from(cookMap.values());

  return (
    <div className="container py-8 grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
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
                <Utensils className="mr-2 h-4 w-4" />
                Dishes
              </Button>
              <Button
                variant={searchMode === 'kitchens' ? 'secondary' : 'ghost'}
                onClick={() => setSearchMode('kitchens')}
                className="w-full justify-center"
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Kitchens
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Filters</h3>
            <LocationAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={setAddress}
            />
          </div>

          <Accordion type="multiple" defaultValue={['sort', 'price', 'delivery', 'service']} className="w-full">
            <AccordionItem value="sort">
              <AccordionTrigger>Sort by</AccordionTrigger>
              <AccordionContent>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest listed</SelectItem>
                    <SelectItem value="price_asc">Price: low to high</SelectItem>
                    <SelectItem value="price_desc">Price: high to low</SelectItem>
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
                  disabled={searchMode === 'kitchens'}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  aria-label="Maximum price"
                  disabled={searchMode === 'kitchens'}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="service">
              <AccordionTrigger>Service Type</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="prepped"
                    checked={serviceTypes.includes('prepped')}
                    onCheckedChange={() => handleServiceTypeChange('prepped')}
                    disabled={searchMode === 'kitchens'}
                  />
                  <Label htmlFor="prepped" className="flex items-center gap-2 font-normal">
                    <Box className="h-4 w-4" /> Prepped Meals
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="catering"
                    checked={serviceTypes.includes('catering')}
                    onCheckedChange={() => handleServiceTypeChange('catering')}
                    disabled={searchMode === 'kitchens'}
                  />
                  <Label htmlFor="catering" className="flex items-center gap-2 font-normal">
                    <PartyPopper className="h-4 w-4" /> Event Catering
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger>Delivery method</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pickup"
                    checked={deliveryFilter === 'PICKUP' || deliveryFilter === 'all'}
                    onCheckedChange={() => setDeliveryFilter(deliveryFilter === 'PICKUP' ? 'all' : 'PICKUP')}
                    disabled={searchMode === 'kitchens'}
                  />
                  <Label htmlFor="pickup">Pickup</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dropoff"
                    checked={deliveryFilter === 'DROP_OFF' || deliveryFilter === 'all'}
                    onCheckedChange={() => setDeliveryFilter(deliveryFilter === 'DROP_OFF' ? 'all' : 'DROP_OFF')}
                    disabled={searchMode === 'kitchens'}
                  />
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
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleCategoryClick(cat.id)}
                    disabled={searchMode === 'kitchens'}
                  >
                    <Icon className="mr-2 h-5 w-5" />
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
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchDishes}>Try again</Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {searchMode === 'dishes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                {dishes.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No dishes found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))
                )}
              </div>
            )}

            {searchMode === 'kitchens' && (
              <div className="space-y-8">
                {cookGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No kitchens found. Try a different search.</p>
                  </div>
                ) : (
                  cookGroups.map(({ cook, dishes: cookDishes }) => (
                    <div key={cook.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-primary">
                          {cook.name?.charAt(0) ?? '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {cook.cookProfile?.kitchenName ?? cook.name}
                          </h3>
                          {cook.location && (
                            <p className="text-sm text-muted-foreground">{cook.location}</p>
                          )}
                          {cook.cookProfile?.avgRating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span>{cook.cookProfile.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {cookDishes.slice(0, 6).map(dish => (
                          <DishCard key={dish.id} dish={dish} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
