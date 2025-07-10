import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function SellPage() {
  return (
    <div className="bg-secondary/50">
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
              Turn Your Kitchen into a Business
            </h1>
            <p className="mt-4 max-w-xl text-lg text-foreground/80">
              Join our community of talented home cooks and share your passion for food with your neighbors. Sign up today to start selling your delicious creations.
            </p>
          </div>

          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Become a Cook</CardTitle>
              <CardDescription>
                Fill out the form below to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="kitchen-name">Kitchen Name</Label>
                <Input id="kitchen-name" type="text" placeholder="Nonna's Kitchen" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">About Your Food</Label>
                <Textarea id="description" placeholder="Tell us about your culinary style and what makes your food special." required />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button className="w-full">Apply to be a Cook</Button>
               <p className="mt-4 text-center text-sm text-muted-foreground">
                Already a cook?{' '}
                <Link href="/login" className="underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}