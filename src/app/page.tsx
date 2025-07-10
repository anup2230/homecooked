import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { DishCard } from "@/components/dish-card";
import { mockDishes, mockTestimonials } from "@/lib/data";
import { ArrowRight, Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HomePage() {
  const featuredDishes = mockDishes.slice(0, 4);
  const trendingDishes = mockDishes.slice(4, 8); // Using different dishes for "trending"

  return (
    <div>
      <section className="relative bg-secondary/50 py-20 md:py-32">
        <div className="container text-center">
           <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary tracking-tight">
            Authentic Homemade Meals,
            <br />
            Delivered to Your Door.
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-foreground/80">
            Explore a world of flavors from talented independent cooks and third-party kitchens in your community.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/discover">Discover Dishes</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
               <Link href="/sell">Become a Cook</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Featured Dishes</h2>
            <Button variant="ghost" asChild>
                <Link href="/discover">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-background py-16 md:py-24">
        <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4 text-center md:text-left">
                    <h2 className="text-3xl font-bold font-headline">Find Meals Near You</h2>
                    <p className="text-muted-foreground text-lg">Discover talented home cooks in your neighborhood. See who's cooking nearby and enjoy fresh, locally-made food.</p>
                    <Button>
                        <MapPin className="mr-2 h-4 w-4" />
                        Explore Local Map
                    </Button>
                </div>
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg border">
                    <Image
                        src="https://placehold.co/800x450.png"
                        alt="Map showing nearby cooks"
                        fill
                        className="object-cover"
                        data-ai-hint="map city"
                    />
                </div>
            </div>
        </div>
      </section>

      <section className="bg-secondary/20 py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Trending Local Dishes</h2>
             <Button variant="ghost" asChild>
                <Link href="/discover">
                    Explore More
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingDishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">What Our Customers Are Saying</h2>
            <p className="mt-2 text-lg text-muted-foreground">Real stories from real food lovers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                      ))}
                  </div>
                  <p className="text-muted-foreground italic">&quot;{testimonial.comment}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
