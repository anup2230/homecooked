import { mockUsers, mockDishes, mockSales } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DishCard } from "@/components/dish-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Edit, PlusCircle } from "lucide-react";

export default function CookProfilePage() {
  // Mocking the logged-in user as a cook
  const currentCook = mockUsers[2]; // Nonna Isabella
  const cookDishes = mockDishes.filter(dish => dish.provider.id === currentCook.id);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-primary/50 shadow-md">
            <AvatarImage src={currentCook.avatarUrl} alt={currentCook.name} />
            <AvatarFallback className="text-4xl">{currentCook.name.charAt(0)}</AvatarFallback>
          </Avatar>
           <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Profile Picture</span>
          </Button>
        </div>
        <div>
          <h1 className="text-4xl font-bold font-headline">{currentCook.name}'s Kitchen</h1>
          <p className="text-muted-foreground">Cook since May 2024</p>
          <p className="mt-2 max-w-prose">Passionate home cook sharing generations of family recipes. Every dish is made with love and the freshest ingredients. Buon appetito!</p>
        </div>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="sales">My Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Food Listings</CardTitle>
                <CardDescription>
                  You have {cookDishes.length} active listings.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/sell/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  List New Dish
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {cookDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cookDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">You haven't listed any dishes yet.</p>
                  <Button asChild>
                    <Link href="/sell/new">List Your First Dish</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
             <CardHeader>
                <CardTitle>My Sales History</CardTitle>
                <CardDescription>A list of all the orders you've fulfilled.</CardDescription>
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
                      <TableCell className="font-medium">{order.dishName} x{order.quantity}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell className="text-right">${order.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
