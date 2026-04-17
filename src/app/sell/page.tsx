"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChefHat, DollarSign, Users } from 'lucide-react';

const cookSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  kitchenName: z.string().min(2, 'Kitchen name must be at least 2 characters'),
  description: z.string().min(20, 'Tell us a bit more about your food (at least 20 characters)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type CookSignupForm = z.infer<typeof cookSignupSchema>;

export default function SellPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CookSignupForm>({
    resolver: zodResolver(cookSignupSchema),
  });

  const onSubmit = async (data: CookSignupForm) => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'COOK',
          kitchenName: data.kitchenName,
          description: data.description,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await login(data.email, data.password);
      if (result.error) {
        router.push('/login');
      } else {
        router.push('/profile'); // Send to profile to complete setup
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-secondary/50">
      <div className="container py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side — value prop */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
                Share Your Passion for Cooking
              </h1>
              <p className="mt-4 max-w-xl text-lg text-foreground/80">
                Join the Homecooked marketplace and turn your kitchen into an independent business. Connect with neighbors who crave authentic, homemade food.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Earn on your own terms</h3>
                  <p className="text-sm text-muted-foreground">Set your own prices, hours, and menus. You're in control.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Build a loyal customer base</h3>
                  <p className="text-sm text-muted-foreground">Neighbors who love your cooking will keep coming back.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Share your culinary story</h3>
                  <p className="text-sm text-muted-foreground">Every dish has a story. We give you the platform to tell it.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side — form */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Become an Independent Cook</CardTitle>
              <CardDescription>
                Fill out the form below to join the Homecooked marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Jane Doe" {...register('name')} disabled={isLoading} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register('email')} disabled={isLoading} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kitchenName">Your Kitchen&apos;s Name</Label>
                  <Input id="kitchenName" placeholder="Nonna's Kitchen" {...register('kitchenName')} disabled={isLoading} />
                  {errors.kitchenName && <p className="text-sm text-destructive">{errors.kitchenName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About Your Food</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your culinary style and what makes your food special..."
                    className="min-h-[100px]"
                    {...register('description')}
                    disabled={isLoading}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...register('password')} disabled={isLoading} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" {...register('confirmPassword')} disabled={isLoading} />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Apply to be a Cook
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline text-foreground ml-1">
                Log in
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
