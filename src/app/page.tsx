import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Pizza, Leaf, Star, UtensilsCrossed } from "lucide-react";
import { mockDishes } from "@/lib/data";
import { DishCard } from "@/components/dish-card";

export default function Home() {
  const filters = [
    { name: "All" },
    { name: "Italian", icon: <Pizza /> },
    { name: "Chinese", icon: <UtensilsCrossed /> },
    { name: "Vegan", icon: <Leaf /> },
    { name: "Top Rated", icon: <Star /> },
  ];
  const activeFilter = "All";

  return (
    <div className="bg-background">
      <section className="py-12 md:py-20 bg-secondary/50">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
            Your Neighborhood Flavor
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Discover authentic, homemade meals from talented local cooks in your community.
          </p>
          <div className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="What are you craving?" className="pl-10 h-12 text-base" />
            </div>
             <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Your location" className="pl-10 h-12 text-base" />
            </div>
            <Button size="lg" className="h-12">
              Find Food
            </Button>
          </div>
        </div>
      </section>

      <div className="container py-10">
        <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
          {filters.map((filter) => (
            <Button key={filter.name} variant={filter.name === activeFilter ? "default" : "outline"}>
              {filter.icon}
              {filter.name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockDishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </div>
    </div>
  );
}
