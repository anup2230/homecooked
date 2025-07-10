import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Pizza, Leaf, Star, UtensilsCrossed, Bean } from "lucide-react";
import { mockDishes } from "@/lib/data";
import { DishCard } from "@/components/dish-card";

const SushiIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21.3,10.2c0,0-1.2-4-3.5-5.3s-4.6-1-4.6-1s-2.3-0.7-4.6,1S5.2,10.2,5.2,10.2s-1.2,4,0,5.3s3.5,2.7,3.5,2.7s2.3,0.7,3.5,0s3.5-2.7,3.5-2.7S22.5,14.2,21.3,10.2z"/>
        <path d="M12,18.8V22"/>
        <path d="M12,2v3.8"/>
        <path d="M10.2,5.2L4,8.8"/>
        <path d="M13.8,5.2l6.2,3.5"/>
        <path d="M10.2,18.8l-6.2-3.5"/>
        <path d="M13.8,18.8l6.2-3.5"/>
    </svg>
)

const TacoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 16.5c-3-2.5-6-2.5-9 0"/>
        <path d="M6.25 12.5c-1.5 2.5-1.5 5.5 0 8"/>
        <path d="M17.75 12.5c1.5 2.5 1.5 5.5 0 8"/>
        <path d="M2 11h20"/>
        <path d="M5 11c-1-2.5-1-5.5 0-8L2.5 2 2 11"/>
        <path d="M19 11c1-2.5 1-5.5 0-8l2.5-1L22 11"/>
        <path d="M9.5 12.5c-1-2-1-4 0-6"/>
        <path d="M14.5 12.5c1-2 1-4 0-6"/>
    </svg>
)


export default function Home() {
  const filters = [
    { name: "All" },
    { name: "Italian", icon: <Pizza /> },
    { name: "Mexican", icon: <TacoIcon /> },
    { name: "Japanese", icon: <SushiIcon /> },
    { name: "Indian", icon: <Bean /> },
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
