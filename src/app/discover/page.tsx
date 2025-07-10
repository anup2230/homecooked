import { DishCard } from "@/components/dish-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { mockDishes } from "@/lib/data";

const categories = [
    'Italian',
    'Mexican',
    'Japanese',
    'Indian',
    'Chinese',
    'American',
    'Salad',
    'Dessert',
];

export default function DiscoverPage() {
    
  return (
    <div className="container py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
          Discover Your Next Favorite Meal
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-foreground/80">
          Explore a world of flavors from talented independent cooks in your community.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => {
            const dishesForCategory = mockDishes.filter(dish => dish.category === category);
            if (dishesForCategory.length === 0) return null;

            return (
                <section key={category}>
                    <h2 className="text-3xl font-bold font-headline mb-6">{category} Dishes</h2>
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {dishesForCategory.map((dish) => (
                                <CarouselItem key={dish.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                    <div className="h-full">
                                        <DishCard dish={dish} />
                                    </div>
                                </CarouselItem>
                            ))}
        
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>
                </section>
            );
        })}
      </div>
    </div>
  );
}
