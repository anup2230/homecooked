"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DishCard } from '@/components/dish-card';
import { Star, MapPin, ShoppingBag, Loader2, MessageCircle, Pencil, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface PublicProfile {
  id: string;
  name: string | null;
  image: string | null;
  location: string | null;
  role: 'BUYER' | 'COOK' | 'ADMIN';
  createdAt: string;
  cookProfile: {
    kitchenName: string;
    description: string | null;
    isVerified: boolean;
    avgRating: number | null;
    totalOrders: number;
    cuisineTags: string[];
    acceptsOrders: boolean;
  } | null;
  dishesCreated: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    category: string | null;
    _count: { reviews: number };
  }[];
  _count: { reviewsReceived: number };
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser?.id === params.id;

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (res.status === 404) {
          router.replace('/discover');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data.user);
      } catch {
        setError('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-12 text-center text-muted-foreground">
        <p>{error || 'Profile not found'}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/discover">Back to Discover</Link>
        </Button>
      </div>
    );
  }

  const isCook = profile.role === 'COOK';

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-24 w-24 border-2 shrink-0">
              <AvatarImage src={profile.image ?? undefined} alt={profile.name ?? 'User'} />
              <AvatarFallback className="text-2xl">{profile.name?.charAt(0) ?? '?'}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold font-headline">
                  {isCook ? profile.cookProfile?.kitchenName : profile.name}
                </h1>
                {isCook && profile.cookProfile?.isVerified && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </Badge>
                )}
                {isCook && !profile.cookProfile?.acceptsOrders && (
                  <Badge variant="destructive">Not accepting orders</Badge>
                )}
              </div>

              {isCook && profile.name && (
                <p className="text-muted-foreground">by {profile.name}</p>
              )}

              {profile.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}

              {isCook && (
                <div className="flex items-center gap-4 text-sm">
                  {profile.cookProfile?.avgRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{profile.cookProfile.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({profile._count.reviewsReceived} reviews)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ShoppingBag className="h-4 w-4" />
                    <span>{profile.cookProfile?.totalOrders} orders</span>
                  </div>
                </div>
              )}

              {isCook && profile.cookProfile?.cuisineTags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.cookProfile.cuisineTags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {isOwnProfile ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/edit">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/messages?newChat=${profile.id}`}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {isCook && profile.cookProfile?.description && (
            <>
              <Separator className="my-4" />
              <p className="text-muted-foreground leading-relaxed">
                {profile.cookProfile.description}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dishes (cook only) */}
      {isCook && profile.dishesCreated.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {profile.dishesCreated.map(dish => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        </div>
      )}

      {isCook && profile.dishesCreated.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isOwnProfile ? (
              <>
                <p>You haven&apos;t listed any dishes yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/profile/edit#dishes">Add your first dish</Link>
                </Button>
              </>
            ) : (
              <p>No dishes available right now.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
