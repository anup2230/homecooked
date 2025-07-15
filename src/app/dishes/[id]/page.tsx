import { mockDishes, mockReviews } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, ChevronLeft, MessageCircle } from "lucide-react";

const StarRating = ({ rating, className }: { rating: number, className?: string }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating) ? "text-primary fill-primary" : "text-muted-foreground/50"
          } ${className}`}
        />
      ))}
    </div>
  );
};

export default function DishDetailPage({ params }: { params: { id:string } }) {
  const dish = mockDishes.find((d) => d.id === params.id);
  const reviews = mockReviews.filter((r) => r.dishId === params.id);

  if (!dish) {
    notFound();
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0;

  return (
    <div className="container py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to all dishes
        </Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
            data-ai-hint={dish['data-ai-hint']}
          />
        </div>
        <div className="flex flex-col space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">{dish.category}</Badge>
            <h1 className="text-4xl font-bold font-headline">{dish.name}</h1>
            <p className="text-2xl font-bold text-primary mt-2">${dish.price.toFixed(2)}</p>
          </div>

          <Link href={`/profile/${dish.provider.id}`} className="group">
            <div className="flex items-center gap-4 rounded-lg p-3 border bg-card/50 group-hover:bg-secondary/50 transition-colors">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={dish.provider.avatarUrl} alt={dish.provider.name} />
                <AvatarFallback>{dish.provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-card-foreground">Cooked by</p>
                <p className="text-lg font-bold text-primary group-hover:underline">{dish.provider.name}</p>
              </div>
            </div>
          </Link>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{dish.description}</p>
          </div>
          
          {dish.dietary && dish.dietary.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {dish.dietary.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg">Order Now</Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/messages">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Ask a question
                </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Separator className="my-12" />

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Reviews ({reviews.length})</h2>
        {reviews.length > 0 ? (
          <>
            <div className="flex justify-center items-center gap-2 mb-8">
              <StarRating rating={averageRating} />
              <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">average rating</span>
            </div>
            <div className="space-y-6">
              {reviews.map(review => (
                <Card key={review.id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                      <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-bold">{review.user.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <p className="text-xs text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">This dish has no reviews yet.</p>
        )}
      </div>
    </div>
  );
}
