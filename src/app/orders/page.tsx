"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useSearchParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, Loader2, RotateCcw } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

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

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  CONFIRMED: 'outline',
  PREPARING: 'outline',
  READY: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

const statusLabel: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const { isLoggedIn, isCook } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const roleParam = searchParams.get('role');
  const viewAsCook = roleParam === 'cook' || isCook;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchOrders();
  }, [isLoggedIn, viewAsCook]);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?role=${viewAsCook ? 'cook' : 'buyer'}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      toast({ title: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.order.status } : o));
      toast({ title: `Order ${statusLabel[status].toLowerCase()}` });
    } catch {
      toast({ title: 'Failed to update order', variant: 'destructive' });
    }
  }

  return (
    <div className="container py-8">
      {/* Tab toggle for cooks */}
      {isCook && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={!viewAsCook ? 'default' : 'outline'}
            asChild
          >
            <Link href="/orders">My Orders (as buyer)</Link>
          </Button>
          <Button
            variant={viewAsCook ? 'default' : 'outline'}
            asChild
          >
            <Link href="/orders?role=cook">My Sales</Link>
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{viewAsCook ? 'Incoming Orders' : 'My Orders'}</CardTitle>
          <CardDescription>
            {viewAsCook
              ? 'Orders from customers for your dishes.'
              : 'A list of your recent food orders on Homecooked.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{viewAsCook ? 'No orders yet.' : "You haven't placed any orders yet."}</p>
              {!viewAsCook && (
                <Button asChild className="mt-4">
                  <Link href="/discover">Browse Dishes</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[80px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Dish</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {viewAsCook ? 'Customer' : 'Cook'}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={order.dish.title}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={order.dish.imageUrl ?? 'https://placehold.co/64x64.png'}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <p>{order.dish.title}</p>
                      <p className="text-sm text-muted-foreground">x{order.quantity}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status]}>
                        {statusLabel[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {viewAsCook ? order.buyer.name : order.cook.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dishes/${order.dish.id}`}>View Dish</Link>
                          </DropdownMenuItem>
                          {!viewAsCook && order.status === 'COMPLETED' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dishes/${order.dish.id}?reorder=true`}>
                                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Order Again
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href="/messages">Messages</Link>
                          </DropdownMenuItem>
                          {/* Cook status transitions */}
                          {viewAsCook && order.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'CONFIRMED')}>
                              Confirm Order
                            </DropdownMenuItem>
                          )}
                          {viewAsCook && order.status === 'CONFIRMED' && (
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'PREPARING')}>
                              Mark Preparing
                            </DropdownMenuItem>
                          )}
                          {viewAsCook && order.status === 'PREPARING' && (
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'READY')}>
                              Mark Ready
                            </DropdownMenuItem>
                          )}
                          {viewAsCook && order.status === 'READY' && (
                            <DropdownMenuItem onClick={() => updateStatus(order.id, 'COMPLETED')}>
                              Mark Completed
                            </DropdownMenuItem>
                          )}
                          {/* Buyer can cancel pending */}
                          {!viewAsCook && order.status === 'PENDING' && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => updateStatus(order.id, 'CANCELLED')}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          )}
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
    </div>
  );
}
