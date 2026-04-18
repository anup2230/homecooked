"use client";

import { mockUsers, mockDishes, mockSales, mockMonthlyRevenue, mockTopDishes } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DishCard } from "@/components/dish-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  DollarSign, Edit, PlusCircle, ShoppingCart, Star,
  TrendingUp, TrendingDown, Package, Clock, CheckCircle2,
  XCircle, Eye, ToggleLeft, BarChart2, Flame
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const statusColors: Record<string, string> = {
  Completed: "bg-green-500",
  Preparing: "bg-yellow-500",
  "Ready for Pickup": "bg-blue-500",
  "Pending Confirmation": "bg-gray-400",
  Cancelled: "bg-red-500",
};

const statusIcons: Record<string, React.ReactNode> = {
  Completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  Preparing: <Clock className="h-4 w-4 text-yellow-500" />,
  "Ready for Pickup": <Package className="h-4 w-4 text-blue-500" />,
  "Pending Confirmation": <Clock className="h-4 w-4 text-gray-400" />,
  Cancelled: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function CookProfilePage() {
  const currentCook = mockUsers[2]; // Nonna Isabella
  const cookDishes = mockDishes.filter(dish => dish.provider.id === currentCook.id);
  const totalRevenue = mockSales.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalDishesSold = mockSales.reduce((acc, sale) => acc + sale.quantity, 0);

  // Analytics derived data
  const currentMonthRevenue = mockMonthlyRevenue[mockMonthlyRevenue.length - 1].revenue;
  const lastMonthRevenue = mockMonthlyRevenue[mockMonthlyRevenue.length - 2].revenue;
  const revenueGrowth = (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1);
  const isGrowthPositive = currentMonthRevenue >= lastMonthRevenue;

  const currentMonthOrders = mockMonthlyRevenue[mockMonthlyRevenue.length - 1].orders;
  const lastMonthOrders = mockMonthlyRevenue[mockMonthlyRevenue.length - 2].orders;
  const orderGrowth = (((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1);

  const avgOrderValue = (currentMonthRevenue / currentMonthOrders).toFixed(2);

  const statusCounts = mockSales.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeListings = cookDishes.length;
  const maxTopDishRevenue = Math.max(...mockTopDishes.map(d => d.revenue));

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="relative shrink-0">
          <Avatar className="w-28 h-28 border-4 border-primary/50 shadow-md">
            <AvatarImage src={currentCook.avatarUrl} alt={currentCook.name} />
            <AvatarFallback className="text-4xl">{currentCook.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-7 w-7 rounded-full">
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-3xl font-bold font-headline">{currentCook.name}'s Kitchen</h1>
            <Badge variant="secondary" className="w-fit">⭐ 4.9 · Top Seller</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Cook since May 2024 · {currentCook.location}</p>
          <p className="mt-2 max-w-prose text-sm">{currentCook.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" asChild>
            <Link href={`/profile/${currentCook.id}`}>
              <Eye className="mr-2 h-4 w-4" /> Public Profile
            </Link>
          </Button>
          <Button asChild>
            <Link href="/sell/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Dish
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentMonthRevenue}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${isGrowthPositive ? 'text-green-600' : 'text-red-500'}`}>
              {isGrowthPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {revenueGrowth}% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthOrders}</div>
            <div className="flex items-center gap-1 text-xs mt-1 text-green-600">
              <TrendingUp className="h-3 w-3" />
              {orderGrowth}% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue}</div>
            <p className="text-xs text-muted-foreground mt-1">per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalDishesSold} total units sold</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ── ANALYTICS ── */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockMonthlyRevenue}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: number) => [`$${v}`, 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Orders chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders per Month</CardTitle>
                <CardDescription>Volume trend over 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockMonthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top dishes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Dishes by Revenue</CardTitle>
                <CardDescription>Your best performers this month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTopDishes.map((dish, i) => (
                  <div key={dish.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">#{i + 1} {dish.name}</span>
                      <span className="text-muted-foreground">${dish.revenue} · {dish.unitsSold} sold</span>
                    </div>
                    <Progress value={(dish.revenue / maxTopDishRevenue) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order status breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Breakdown</CardTitle>
              <CardDescription>Current state of all your orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    {statusIcons[status]}
                    <span className="font-medium">{count}</span>
                    <span className="text-muted-foreground">{status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LISTINGS ── */}
        <TabsContent value="listings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Food Listings</CardTitle>
                <CardDescription>{cookDishes.length} active listings</CardDescription>
              </div>
              <Button asChild>
                <Link href="/sell/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> List New Dish
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {cookDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cookDishes.map((dish) => (
                    <div key={dish.id} className="relative group">
                      <DishCard dish={dish} />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="secondary" className="h-7 w-7" asChild>
                          <Link href={`/dishes/${dish.id}/edit`}><Edit className="h-3 w-3" /></Link>
                        </Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7">
                          <ToggleLeft className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">You haven't listed any dishes yet.</p>
                  <Button asChild><Link href="/sell/new">List Your First Dish</Link></Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ORDERS ── */}
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales History</CardTitle>
              <CardDescription>All orders fulfilled by your kitchen · ${totalRevenue.toFixed(2)} total earned</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSales.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.dishName}
                        <span className="text-muted-foreground text-xs ml-1">×{order.quantity}</span>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {statusIcons[order.status]}
                          <span className="text-sm">{order.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{order.orderDate}</TableCell>
                      <TableCell className="text-right font-medium">${order.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SETTINGS ── */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Kitchen Settings</CardTitle>
              <CardDescription>Manage your profile, availability, and payout preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Button variant="outline" className="justify-start gap-2" asChild>
                  <Link href="/profile/edit"><Edit className="h-4 w-4" /> Edit Profile & Bio</Link>
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <DollarSign className="h-4 w-4" /> Payout Settings
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Package className="h-4 w-4" /> Delivery Preferences
                </Button>
                <Button variant="outline" className="justify-start gap-2">
                  <Star className="h-4 w-4" /> Reviews & Ratings
                </Button>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-sm">Kitchen Status</h3>
                <p className="text-sm text-muted-foreground">Toggle whether your kitchen is currently accepting new orders.</p>
                <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">🟢 Open for Orders</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
