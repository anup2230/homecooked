"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { StripeCheckout } from '@/components/stripe-checkout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderDetail {
  id: string;
  quantity: number;
  totalPrice: number;
  status: string;
  notes: string | null;
  dish: { id: string; title: string; imageUrl: string | null; price: number };
  cook: { id: string; name: string | null };
}

export default function CheckoutPage({ params }: { params: { orderId: string } }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`);
        if (res.status === 403 || res.status === 404) {
          router.replace('/orders');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        // Only PENDING orders can be checked out
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
  }, [isLoggedIn, params.orderId, router]);

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
          <CardDescription>Secure payment powered by Stripe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0">
              <Image
                src={order.dish.imageUrl ?? 'https://placehold.co/64x64.png'}
                alt={order.dish.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{order.dish.title}</p>
              <p className="text-sm text-muted-foreground">
                by {order.cook.name} · Qty: {order.quantity}
              </p>
            </div>
            <p className="font-semibold">${order.totalPrice.toFixed(2)}</p>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Stripe Checkout */}
          <StripeCheckout orderId={order.id} amount={order.totalPrice} />
        </CardContent>
      </Card>
    </div>
  );
}
