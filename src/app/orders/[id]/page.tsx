"use client";

import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Clock, CheckCircle2, ChefHat, Package, ShoppingBag,
  XCircle, MapPin, MessageCircle, RotateCcw, Loader2, ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface Order {
  id: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  dish: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    description: string | null;
  };
  buyer: { id: string; name: string | null; image: string | null };
  cook: {
    id: string;
    name: string | null;
    image: string | null;
    cookProfile: {
      kitchenName: string;
      pickupNeighborhood: string | null;
      pickupAddress: string | null;
    } | null;
  };
}

const TIMELINE: { status: OrderStatus; label: string; description: string; icon: React.ElementType }[] = [
  { status: 'PENDING',   label: 'Order Placed',    description: 'Waiting for cook to confirm', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed',        description: 'Cook has accepted your order', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'Being Prepared',   description: 'Your food is being cooked', icon: ChefHat },
  { status: 'READY',     label: 'Ready for Pickup', description: 'Head over to pick it up!', icon: Package },
  { status: 'COMPLETED', label: 'Picked Up',        description: 'Enjoy your meal! 🎉', icon: ShoppingBag },
];

const STATUS_ORDER: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];

function getStepIndex(status: OrderStatus) {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { user, isLoggedIn, isCook } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login'); return; }
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(data => setOrder(data.order ?? null))
      .catch(() => toast({ title: 'Failed to load order', variant: 'destructive' }))
      .finally(() => setIsLoading(false));
  }, [id, isLoggedIn]);

  async function updateStatus(status: OrderStatus) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setOrder(prev => prev ? { ...prev, status: data.order.status } : prev);
      toast({ title: `Order updated ✓` });
    } catch {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild className="mt-4" variant="outline"><Link href="/orders">Back to orders</Link></Button>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyer.id;
  const isOrderCook = user?.id === order.cook.id;
  const isCancelled = order.status === 'CANCELLED';
  const currentStep = getStepIndex(order.status);

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href={isCook ? "/orders?role=cook" : "/orders"}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to orders
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border">
          <Image
            src={order.dish.imageUrl ?? 'https://placehold.co/80x80.png'}
            alt={order.dish.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold font-headline truncate">{order.dish.title}</h1>
          <p className="text-sm text-muted-foreground">
            ×{order.quantity} · ${order.totalPrice.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Order #{order.id.slice(-8).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        {isCancelled ? (
          <Badge variant="destructive">Cancelled</Badge>
        ) : (
          <Badge variant="outline" className="shrink-0 text-primary border-primary">
            {order.status.charAt(0) + order.status.slice(1).toLowerCase().replace('_', ' ')}
          </Badge>
        )}
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {TIMELINE.map((step, i) => {
                const isCompleted = currentStep > i;
                const isCurrent = currentStep === i;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="flex gap-4 pb-6 last:pb-0 relative">
                    {/* Connector line */}
                    {i < TIMELINE.length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                    )}

                    {/* Icon bubble */}
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? 'border-primary bg-primary text-primary-foreground'
                        : isCurrent
                          ? 'border-primary bg-background text-primary animate-pulse'
                          : 'border-border bg-background text-muted-foreground'
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* Label */}
                    <div className="pt-1">
                      <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {(isCurrent || isCompleted) && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cook actions */}
      {isOrderCook && !isCancelled && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Update Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {order.status === 'PENDING' && (
              <Button onClick={() => updateStatus('CONFIRMED')} disabled={isUpdating} size="sm" className="bg-green-600 hover:bg-green-700">
                ✓ Confirm Order
              </Button>
            )}
            {order.status === 'CONFIRMED' && (
              <Button onClick={() => updateStatus('PREPARING')} disabled={isUpdating} size="sm">
                Mark Preparing
              </Button>
            )}
            {order.status === 'PREPARING' && (
              <Button onClick={() => updateStatus('READY')} disabled={isUpdating} size="sm">
                Mark Ready for Pickup
              </Button>
            )}
            {order.status === 'READY' && (
              <Button onClick={() => updateStatus('COMPLETED')} disabled={isUpdating} size="sm">
                Mark Completed
              </Button>
            )}
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin self-center" />}
          </CardContent>
        </Card>
      )}

      {/* Buyer actions */}
      {isBuyer && order.status === 'PENDING' && (
        <Button
          variant="destructive"
          size="sm"
          disabled={isUpdating}
          onClick={() => updateStatus('CANCELLED')}
        >
          <XCircle className="h-4 w-4 mr-1.5" /> Cancel Order
        </Button>
      )}

      {/* Pickup info */}
      {order.cook.cookProfile && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-start gap-2">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={order.cook.image ?? undefined} />
                <AvatarFallback>{order.cook.cookProfile.kitchenName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{order.cook.cookProfile.kitchenName}</p>
                {order.cook.cookProfile.pickupAddress ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {order.cook.cookProfile.pickupAddress}
                  </p>
                ) : order.cook.cookProfile.pickupNeighborhood ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {order.cook.cookProfile.pickupNeighborhood} · Full address shown after confirmation
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Footer actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/messages">
            <MessageCircle className="h-4 w-4 mr-1.5" /> Message {isBuyer ? 'Cook' : 'Buyer'}
          </Link>
        </Button>
        {isBuyer && order.status === 'COMPLETED' && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/dishes/${order.dish.id}?reorder=true`}>
              <RotateCcw className="h-4 w-4 mr-1.5" /> Order Again
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
