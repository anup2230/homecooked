import { mockUsers, mockOrders } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";

export default function ProfilePage() {
  // Mocking the logged-in user as a consumer
  const currentUser = mockUsers[4]; // Alice Johnson, a consumer
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
          <p className="text-muted-foreground">Joined June 2024</p>
          <p className="mt-2 max-w-prose">Food enthusiast and lover of all things homemade. Always looking for the next delicious meal!</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <Card>
             <CardHeader>
                <CardTitle>My Order History</CardTitle>
                <CardDescription>A list of all the delicious meals you've ordered.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish</TableHead>
                    <TableHead>Cook</TableHead>
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
                      <TableCell><Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
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
                    <Input id="email" type="email" defaultValue="alice.j@example.com" />
                </div>
                <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
