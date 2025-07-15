import { mockOrders } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            A list of your recent food orders on Homecooked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Dish</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Provider</TableHead>
                <TableHead className="hidden md:table-cell">
                  Date
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
                 <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={order.dish.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={order.dish.imageUrl}
                      width="64"
                      data-ai-hint={order.dish['data-ai-hint']}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <p>{order.dish.name}</p>
                    <p className="text-sm text-muted-foreground">x{order.quantity}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                  </TableCell>
                   <TableCell className="hidden md:table-cell">
                    {order.dish.provider.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.orderDate}
                  </TableCell>
                  <TableCell className="text-right">${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dishes/${order.dish.id}`}>View Dish</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                           <Link href="/messages">Contact Provider</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
