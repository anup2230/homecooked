"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, CheckCircle2, Lock, CreditCard, Info, Home, Truck, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface OrderDetail {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  dish: { id: string; title: string; imageUrl: string | null; price: number };
  cook: {
    id: string;
    name: string | null;
    cookProfile: {
      kitchenName: string;
      pickupNeighborhood: string | null;
      pickupAddress: string | null;
      dropoffAvailable: boolean;
      dropoffNotes: string | null;
    } | null;
  };
}

export default function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = React.use(params);
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Detect if Stripe is configured (not placeholder)
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
  const stripeConfigured = stripeKey.startsWith('pk_') && !stripeKey.includes('...');

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.status === 403 || res.status === 404) {
          router.replace('/orders');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        if (data.order.status !== 'PENDING') {
          router.replace('/orders');
          return;
        }
        setOrder(data.order);
      } catch {
        setError('Failed to load order details.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [isLoggedIn, orderId, router]);

  // Dev mode: simulate payment confirmation
  const handleDevPayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    try {
      // Mark order as CONFIRMED directly
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });
      if (!res.ok) throw new Error('Failed to confirm order');
      setPaymentDone(true);
      toast({ title: 'Order confirmed! 🎉', description: 'The cook has been notified.' });
    } catch (err: any) {
      toast({ title: 'Failed to confirm order', description: err.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">{error || 'Order not found'}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (paymentDone) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Your order for <span className="font-medium">{order.dish.title}</span> has been sent to{' '}
          <span className="font-medium">{order.cook.cookProfile?.kitchenName ?? order.cook.name}</span>. They'll start preparing it soon.
        </p>
        {order.cook.cookProfile?.pickupAddress && (
          <div className="rounded-lg border bg-card p-4 text-sm text-left space-y-1">
            <p className="font-semibold flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> Pickup Address</p>
            <p className="text-muted-foreground">{order.cook.cookProfile.pickupAddress}</p>
          </div>
        )}
        {order.cook.cookProfile?.dropoffAvailable && (
          <div className="rounded-lg border bg-card p-4 text-sm text-left space-y-1">
            <p className="font-semibold flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Drop-off</p>
            <p className="text-muted-foreground">{order.cook.cookProfile.dropoffNotes ?? 'Drop-off available — message the cook for details.'}</p>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-4">
          <Button asChild>
            <Link href="/orders">View My Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/discover">Continue Browsing</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Checkout card ──────────────────────────────────────────────────────────
  return (
    <div className="container py-8 max-w-lg mx-auto">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/orders">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Complete Your Order</CardTitle>
          <CardDescription>Review your order before confirming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Order summary */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 border">
              <Image
                src={order.dish.imageUrl ?? 'https://placehold.co/64x64.png'}
                alt={order.dish.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{order.dish.title}</p>
              <p className="text-sm text-muted-foreground">
                by {order.cook.name} · Qty: {order.quantity}
              </p>
              {order.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic">"{order.notes}"</p>
              )}
            </div>
            <p className="font-semibold shrink-0">${order.totalPrice.toFixed(2)}</p>
          </div>

          {/* Pickup location preview */}
          {order.cook.cookProfile && (
            <div className="rounded-lg bg-secondary/50 p-3 text-sm space-y-1.5">
              {order.cook.cookProfile.pickupNeighborhood && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Home className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>Home pickup · <span className="font-medium text-foreground">{order.cook.cookProfile.pickupNeighborhood}</span></span>
                </div>
              )}
              {order.cook.cookProfile.dropoffAvailable && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{order.cook.cookProfile.dropoffNotes ?? 'Drop-off available'}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                <MapPin className="h-3 w-3 shrink-0" />
                Full address shared after order is confirmed
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform fee</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-primary">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Payment section */}
          {stripeConfigured ? (
            // Real Stripe checkout (when keys are set)
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4" /> Secure payment
              </p>
              <Button
                className="w-full"
                size="lg"
                onClick={() => router.push(`/checkout/${orderId}/payment`)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ${order.totalPrice.toFixed(2)} with Stripe
              </Button>
            </div>
          ) : (
            // Dev mode bypass
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-lg border border-yellow-400/50 bg-yellow-50 dark:bg-yellow-950/20 p-3 text-sm">
                <Info className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-yellow-800 dark:text-yellow-300">
                  <p className="font-medium">Dev mode — Stripe not configured</p>
                  <p className="text-xs mt-0.5 opacity-80">
                    Add real Stripe keys to <code>.env.local</code> to enable payments.
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleDevPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                Confirm Order (Skip Payment)
              </Button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            {stripeConfigured
              ? 'Secured by Stripe. Your card details are never stored on our servers.'
              : 'Payment will be collected once Stripe is configured.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
