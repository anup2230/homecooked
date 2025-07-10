
import { mockUsers, mockDishes } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DishCard } from "@/components/dish-card";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

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
          {localProviders.map(provider => {
            const providerDishes = mockDishes.filter(dish => dish.provider.id === provider.id).slice(0, 3);
            return (
              <div key={provider.id}>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={provider.avatarUrl} alt={provider.name} />
                    <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold font-headline">{provider.name}'s Kitchen</h2>
                    {provider.distance && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        <span>{provider.distance}</span>
                      </div>
                    )}
                  </div>
                </div>

                {providerDishes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {providerDishes.map(dish => (
                      <DishCard key={dish.id} dish={dish} />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    {provider.name} doesn't have any dishes listed at the moment.
                  </p>
                )}
                
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
