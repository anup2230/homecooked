"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, ChevronLeft, MessageCircle, Loader2, ShoppingCart, AlertCircle } from "lucide-react";
import { useAuth } from '@/context/auth-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-primary fill-primary" : "text-muted-foreground/50"}`}
      />
    ))}
  </div>
);

interface DishDetail {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  dietary: string[];
  allergens: string[];
  deliveryOptions: string[];
  serviceType: string;
  isAvailable: boolean;
  cook: {
    id: string;
    name: string | null;
    image: string | null;
    location: string | null;
    cookProfile: {
      kitchenName: string;
      description: string | null;
      isVerified: boolean;
      avgRating: number | null;
      totalOrders: number;
      acceptsOrders: boolean;
    } | null;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    reviewer: { id: string; name: string | null; image: string | null };
  }[];
  _count: { reviews: number; orders: number };
}

export default function DishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [dish, setDish] = useState<DishDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDish() {
      try {
        const res = await fetch(`/api/dishes/${id}`);
        if (res.status === 404) {
          router.replace('/discover');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch dish');
        const data = await res.json();
        setDish(data.dish);
      } catch (err) {
        setError('Failed to load dish details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDish();
  }, [id, router]);

  const handleActionClick = (callback: () => void) => {
    if (isLoggedIn) {
      callback();
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleOrder = async () => {
    if (!dish) return;
    setIsOrdering(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId: dish.id, quantity: 1 }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      const { order } = await res.json();
      toast({
        title: "Order placed! 🎉",
        description: `Proceeding to checkout...`,
      });
      router.push(`/checkout/${order.id}`);
    } catch (err: any) {
      toast({
        title: "Order failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center flex-col gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">{error || 'Dish not found'}</p>
        <Button asChild variant="outline">
          <Link href="/discover">Back to Discover</Link>
        </Button>
      </div>
    );
  }

  const avgRating = dish.reviews.length > 0
    ? dish.reviews.reduce((sum, r) => sum + r.rating, 0) / dish.reviews.length
    : 0;

  const isOwnDish = user?.id === dish.cook.id;

  return (
    <>
      <div className="container py-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/discover">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to all dishes
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
            <Image
              src={dish.imageUrl ?? 'https://placehold.co/600x400.png'}
              alt={dish.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col space-y-6">
            <div>
              {dish.category && (
                <Badge variant="secondary" className="mb-2">{dish.category}</Badge>
              )}
              <h1 className="text-4xl font-bold font-headline">{dish.title}</h1>
              <p className="text-2xl font-bold text-primary mt-2">${dish.price.toFixed(2)}</p>
              {!dish.isAvailable && (
                <Badge variant="destructive" className="mt-2">Currently unavailable</Badge>
              )}
            </div>

            <Link href={`/profile/${dish.cook.id}`} className="group">
              <div className="flex items-center gap-4 rounded-lg p-3 border bg-card/50 group-hover:bg-secondary/50 transition-colors">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={dish.cook.image ?? undefined} alt={dish.cook.name ?? 'Cook'} />
                  <AvatarFallback>{dish.cook.name?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-card-foreground">Cooked by</p>
                  <p className="text-lg font-bold text-primary group-hover:underline">
                    {dish.cook.cookProfile?.kitchenName ?? dish.cook.name}
                  </p>
                  {dish.cook.cookProfile?.avgRating && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span>{dish.cook.cookProfile.avgRating.toFixed(1)}</span>
                      <span>· {dish.cook.cookProfile.totalOrders} orders</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>

            {dish.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{dish.description}</p>
              </div>
            )}

            {dish.dietary.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Dietary</h3>
                <div className="flex flex-wrap gap-2">
                  {dish.dietary.map(tag => (
                    <Badge key={tag} variant="outline">{tag.replace('_', ' ').toLowerCase()}</Badge>
                  ))}
                </div>
              </div>
            )}

            {dish.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Allergens</h3>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map(a => (
                    <Badge key={a} variant="secondary">{a}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {!isOwnDish && (
                <Button
                  size="lg"
                  onClick={() => handleActionClick(handleOrder)}
                  disabled={!dish.isAvailable || isOrdering}
                >
                  {isOrdering ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  {dish.isAvailable ? 'Order Now' : 'Unavailable'}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleActionClick(() => router.push('/messages'))}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask a question
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Reviews ({dish._count.reviews})
          </h2>
          {dish.reviews.length > 0 ? (
            <>
              <div className="flex justify-center items-center gap-2 mb-8">
                <StarRating rating={avgRating} />
                <span className="font-bold text-lg">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">average rating</span>
              </div>
              <div className="space-y-6">
                {dish.reviews.map(review => (
                  <Card key={review.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={review.reviewer.image ?? undefined} alt={review.reviewer.name ?? 'User'} />
                        <AvatarFallback>{review.reviewer.name?.charAt(0) ?? '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base font-bold">{review.reviewer.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} />
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    {review.comment && (
                      <CardContent>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No reviews yet. Be the first to order!</p>
          )}
        </div>
      </div>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create an account to continue</AlertDialogTitle>
            <AlertDialogDescription>
              To order dishes or contact cooks, you need to be logged in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/register">Sign Up</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
