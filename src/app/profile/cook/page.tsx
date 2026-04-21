"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  DollarSign, Edit, PlusCircle, ShoppingCart, Star,
  Package, Clock, CheckCircle2, XCircle, Eye, MoreHorizontal,
  Flame, Link2, Loader2, ChefHat, CalendarClock, AlertCircle
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface CookProfile {
  kitchenName: string;
  description: string | null;
  isVerified: boolean;
  isDraft: boolean;
  onboardingStep: number;
  avgRating: number | null;
  totalOrders: number;
  cuisineTags: string[];
  acceptsOrders: boolean;
  instagramHandle: string | null;
  pickupNeighborhood: string | null;
}

interface Dish {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  isAvailable: boolean;
}

interface Order {
  id: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  dish: { id: string; title: string; imageUrl: string | null; price: number };
  buyer: { id: string; name: string | null; image: string | null };
  cook: { id: string; name: string | null };
}

const statusLabel: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const statusIcon: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-gray-400" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
  PREPARING: <Clock className="h-4 w-4 text-yellow-500" />,
  READY: <Package className="h-4 w-4 text-blue-500" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  CANCELLED: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function CookKitchenPage() {
  const { user, isCook, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [cookProfile, setCookProfile] = useState<CookProfile | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.replace('/login'); return; }
    if (!isCook) { router.replace('/profile/me'); return; }
  }, [authLoading, isLoggedIn, isCook]);

  // Load cook profile + dishes
  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingProfile(true);
    fetch(`/api/users/${user.id}`)
      .then(r => r.json())
      .then(data => {
        setCookProfile(data.user?.cookProfile ?? null);
        setDishes(data.user?.dishesCreated ?? []);
      })
      .catch(() => toast({ title: 'Failed to load profile', variant: 'destructive' }))
      .finally(() => setIsLoadingProfile(false));
  }, [user?.id]);

  // Load orders
  useEffect(() => {
    if (!user?.id) return;
    setIsLoadingOrders(true);
    fetch('/api/orders?role=cook')
      .then(r => r.json())
      .then(data => setOrders(data.orders ?? []))
      .catch(() => toast({ title: 'Failed to load orders', variant: 'destructive' }))
      .finally(() => setIsLoadingOrders(false));
  }, [user?.id]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.order.status } : o));
      toast({ title: `Order marked as ${statusLabel[status]}` });
    } catch {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  }

  async function toggleDishAvailability(dishId: string, isAvailable: boolean) {
    try {
      await fetch(`/api/dishes/${dishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      setDishes(prev => prev.map(d => d.id === dishId ? { ...d, isAvailable } : d));
    } catch {
      toast({ title: 'Failed to update dish', variant: 'destructive' });
    }
  }

  // Stats
  const totalRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const activeOrders = orders.filter(o => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status)).length;
  const activeDishes = dishes.filter(d => d.isAvailable).length;

  if (authLoading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <Avatar className="w-24 h-24 border-4 border-primary/30 shadow-md">
          <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'Cook'} />
          <AvatarFallback className="text-3xl">
            <ChefHat className="h-10 w-10" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h1 className="text-3xl font-bold font-headline">
              {cookProfile?.kitchenName ?? `${user?.name}'s Kitchen`}
            </h1>
            {cookProfile?.isVerified && (
              <Badge variant="secondary">✓ Verified</Badge>
            )}
            {cookProfile?.avgRating && (
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                {cookProfile.avgRating.toFixed(1)}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {cookProfile?.totalOrders ?? 0} total orders
            {cookProfile?.pickupNeighborhood ? ` · ${cookProfile.pickupNeighborhood}` : ''}
          </p>
          {cookProfile?.description && (
            <p className="mt-2 max-w-prose text-sm">{cookProfile.description}</p>
          )}
          {cookProfile?.cuisineTags && cookProfile.cuisineTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {cookProfile.cuisineTags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => {
            const url = `${window.location.origin}/profile/${user?.id}`;
            navigator.clipboard.writeText(url);
            toast({ title: 'Profile link copied!' });
          }}>
            <Link2 className="mr-2 h-4 w-4" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/pickup-slots">
              <CalendarClock className="mr-2 h-4 w-4" /> Pickup Slots
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/profile/${user?.id}`}>
              <Eye className="mr-2 h-4 w-4" /> Public View
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/pickup-slots">
              <Clock className="mr-2 h-4 w-4" /> Pickup Slots
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/profile/edit">
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Draft / pending approval banner */}
      {cookProfile?.isDraft && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 p-4">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">Pending approval</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">
              Your kitchen is in draft mode and not visible to buyers yet. We'll notify you once you're approved (usually 24–48 hours).
            </p>
          </div>
          {cookProfile.onboardingStep < 6 && (
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <Link href="/onboarding">Complete Setup</Link>
            </Button>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">from completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">need confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">confirmed / preparing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Dishes</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDishes}</div>
            <p className="text-xs text-muted-foreground mt-1">of {dishes.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Incoming Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Incoming Orders</CardTitle>
            <CardDescription>Manage and update your customer orders.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/orders?role=cook">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No active orders right now.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dish</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders
                  .filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
                  .map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <p>{order.dish.title}</p>
                        <p className="text-xs text-muted-foreground">×{order.quantity}</p>
                      </TableCell>
                      <TableCell>{order.buyer.name ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {statusIcon[order.status]}
                          <span className="text-sm">{statusLabel[order.status]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {order.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => updateStatus(order.id, 'CONFIRMED')}>
                                ✓ Confirm Order
                              </DropdownMenuItem>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <DropdownMenuItem onClick={() => updateStatus(order.id, 'PREPARING')}>
                                Mark Preparing
                              </DropdownMenuItem>
                            )}
                            {order.status === 'PREPARING' && (
                              <DropdownMenuItem onClick={() => updateStatus(order.id, 'READY')}>
                                Mark Ready
                              </DropdownMenuItem>
                            )}
                            {order.status === 'READY' && (
                              <DropdownMenuItem onClick={() => updateStatus(order.id, 'COMPLETED')}>
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                              <Link href="/messages">Message Buyer</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dish Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Dishes</CardTitle>
            <CardDescription>Toggle availability or add new dishes to your menu.</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link href="/profile/edit#dishes">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Dish
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {dishes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No dishes yet.</p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/profile/edit#dishes">Add your first dish</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {dishes.map(dish => (
                <div key={dish.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{dish.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${dish.price.toFixed(2)}{dish.category ? ` · ${dish.category}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {dish.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                    <Switch
                      checked={dish.isAvailable}
                      onCheckedChange={val => toggleDishAvailability(dish.id, val)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
