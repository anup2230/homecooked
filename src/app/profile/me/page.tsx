import { mockUsers, mockDishes, mockOrders } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DishCard } from "@/components/dish-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Edit } from "lucide-react";

export default function ProfilePage() {
  // Mocking the logged-in user as Nonna Isabella
  const currentUser = mockUsers[2];
  const userDishes = mockDishes.filter(dish => dish.provider.id === currentUser.id);
  const userOrders = mockOrders; // In a real app, this would be filtered for the current user

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-background shadow-md">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback className="text-4xl">{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
           <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-8 w-8 rounded-full">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Profile Picture</span>
          </Button>
        </div>
        <div>
          <h1 className="text-4xl font-bold font-headline">{currentUser.name}</h1>
          <p className="text-muted-foreground">Joined May 2024</p>
          <p className="mt-2 max-w-prose">Passionate home cook sharing generations of family recipes. Every dish is made with love and the freshest ingredients. Buon appetito!</p>
        </div>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>My Food Listings</CardTitle>
              <CardDescription>
                Manage your available dishes. You have {userDishes.length} listings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userDishes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userDishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">You haven't listed any dishes yet.</p>
                  <Button asChild>
                    <Link href="/sell">List Your First Dish</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="orders">
          <Card>
             <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>A list of your past orders.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.dish.name} x{order.quantity}</TableCell>
                      <TableCell>{order.dish.provider.name}</TableCell>
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
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Update your profile information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={currentUser.name} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="nonna.isabella@example.com" />
                </div>
                <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
