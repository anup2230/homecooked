
import { mockUsers, mockDishes } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DishCard } from "@/components/dish-card";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { KitchenResultCard } from "@/components/kitchen-result-card";

export default function MapPage() {
  const localProviders = mockUsers.filter(u => u.isProvider);

  return (
    <div className="bg-background">
      <section className="relative h-96 bg-muted">
        <Image
          src="https://placehold.co/1600x600.png"
          alt="Map of the city"
          fill
          className="object-cover"
          data-ai-hint="city map"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative container h-full flex flex-col justify-end pb-12 text-white">
          <div className="bg-black/50 p-6 rounded-lg backdrop-blur-sm max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
              Cooks in Your Neighborhood
            </h1>
            <p className="mt-2 text-lg text-white/90">
              Browse providers by location and discover hidden culinary gems right around the corner.
            </p>
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="space-y-12">
          {localProviders.map(provider => (
             <KitchenResultCard 
                key={provider.id} 
                provider={provider} 
                dishes={mockDishes.filter(dish => dish.provider.id === provider.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
