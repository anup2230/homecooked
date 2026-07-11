"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/image-upload';
import { Loader2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const profileSchema = z.object({
  name: z.string().min(2),
  location: z.string().optional(),
  kitchenName: z.string().optional(),
  description: z.string().optional(),
  acceptsOrders: z.boolean().optional(),
  instagramHandle: z.string().optional(),
  pickupNeighborhood: z.string().optional(),
  pickupAddress: z.string().optional(),
  dropoffAvailable: z.boolean().optional(),
  dropoffNotes: z.string().optional(),
  confirmationMessage: z.string().max(500).optional(),
  cancellationPolicy: z.string().max(500).optional(),
  bannerUrl: z.string().url().nullable().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const { user, isCook, isLoggedIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [cuisineTags, setCuisineTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', acceptsOrders: true },
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    if (user?.id) {
      fetch(`/api/users/${user.id}`)
        .then(r => r.json())
        .then(data => {
          const u = data.user;
          profileForm.reset({
            name: u.name ?? '',
            location: u.location ?? '',
            kitchenName: u.cookProfile?.kitchenName ?? '',
            description: u.cookProfile?.description ?? '',
            acceptsOrders: u.cookProfile?.acceptsOrders ?? true,
            confirmationMessage: u.cookProfile?.confirmationMessage ?? '',
            cancellationPolicy: u.cookProfile?.cancellationPolicy ?? '',
          });
          setCuisineTags(u.cookProfile?.cuisineTags ?? []);
        });
    }
  }, [isLoggedIn, user?.id]);

  const addCuisineTag = () => {
    const tag = tagInput.trim();
    if (tag && !cuisineTags.includes(tag)) {
      setCuisineTags(prev => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeCuisineTag = (tag: string) => {
    setCuisineTags(prev => prev.filter(t => t !== tag));
  };

  const onSaveProfile = async (data: ProfileForm) => {
    if (!user?.id) return;
    setIsSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          location: data.location,
          ...(isCook
            ? {
                cookProfile: {
                  kitchenName: data.kitchenName,
                  description: data.description,
                  cuisineTags,
                  acceptsOrders: data.acceptsOrders,
                  instagramHandle: data.instagramHandle || null,
                  pickupNeighborhood: data.pickupNeighborhood || null,
                  pickupAddress: data.pickupAddress || null,
                  dropoffAvailable: data.dropoffAvailable ?? false,
                  dropoffNotes: data.dropoffNotes || null,
                  confirmationMessage: data.confirmationMessage || null,
                  cancellationPolicy: data.cancellationPolicy || null,
                },
              }
            : {}),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast({ title: 'Profile saved ✓' });
      router.push(`/profile/${user.id}`);
    } catch {
      toast({ title: 'Failed to save profile', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Edit Profile</h1>
        <div className="flex items-center gap-2">
          {isCook && (
            <Button asChild variant="outline">
              <Link href="/profile/edit/dishes">Edit Dishes</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={`/profile/${user?.id}`}>View Profile</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Info</CardTitle>
          <CardDescription>Update your name, location, and basic details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <ImageUpload
                folder="avatars"
                value={user?.image ?? null}
                onUpload={async (url) => {
                  if (!user?.id) return;
                  await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: url }),
                  });
                  toast({ title: 'Profile photo updated ✓' });
                }}
                aspectRatio="aspect-square"
                className="w-20 h-20 rounded-full overflow-hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground">Click to upload · JPEG/PNG up to 5MB</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="San Francisco, CA" {...profileForm.register('location')} />
            </div>

            {isCook && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Kitchen Name</Label>
                  <Input placeholder="Nonna's Kitchen" {...profileForm.register('kitchenName')} />
                </div>

                <div className="space-y-2">
                  <Label>About Your Kitchen</Label>
                  <Textarea
                    placeholder="Tell customers what makes your food special..."
                    className="min-h-[100px]"
                    {...profileForm.register('description')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cuisine Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {cuisineTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeCuisineTag(tag)}
                          className="hover:text-destructive ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Italian"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCuisineTag())}
                    />
                    <Button type="button" variant="outline" onClick={addCuisineTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instagram Handle</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <Input
                      className="pl-7"
                      placeholder="yourcookinhandle"
                      {...profileForm.register('instagramHandle')}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link your Instagram so customers can follow your food journey.
                  </p>
                </div>

                <Separator />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Pickup & Delivery</h3>
                  <p className="text-xs text-muted-foreground">Customers see your neighborhood publicly. Full address is only shared after an order is confirmed.</p>
                </div>

                <div className="space-y-2">
                  <Label>General Area <span className="text-muted-foreground">(shown publicly)</span></Label>
                  <Input
                    placeholder="e.g. Mission District, SF"
                    {...profileForm.register('pickupNeighborhood')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Full Pickup Address <span className="text-muted-foreground">(only shared after order)</span></Label>
                  <Input
                    placeholder="e.g. 123 Valencia St, San Francisco, CA 94110"
                    {...profileForm.register('pickupAddress')}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      id="dropoffAvailable"
                      checked={profileForm.watch('dropoffAvailable') ?? false}
                      onCheckedChange={val => profileForm.setValue('dropoffAvailable', val)}
                    />
                    <Label htmlFor="dropoffAvailable">Offer drop-off delivery</Label>
                  </div>
                  {profileForm.watch('dropoffAvailable') && (
                    <div className="space-y-2">
                      <Label>Drop-off details</Label>
                      <Input
                        placeholder="e.g. Within 3 miles of Mission District, $5 fee"
                        {...profileForm.register('dropoffNotes')}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Switch
                    id="acceptsOrders"
                    checked={profileForm.watch('acceptsOrders')}
                    onCheckedChange={val => profileForm.setValue('acceptsOrders', val)}
                  />
                  <Label htmlFor="acceptsOrders">Currently accepting orders</Label>
                </div>

                <Separator />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Order Confirmation Message</h3>
                  <p className="text-xs text-muted-foreground">This message is automatically sent to the buyer when you confirm their order. Great for sharing pickup instructions, timing, or a personal note.</p>
                </div>

                <div className="space-y-2">
                  <Label>Default confirmation message <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    placeholder={`e.g. "Hi! Your order is confirmed 🎉 I'll have it ready at 123 Valencia St. Please arrive between 5–6pm. Text me if you need anything!"`}
                    className="min-h-[100px]"
                    maxLength={500}
                    {...profileForm.register('confirmationMessage')}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(profileForm.watch('confirmationMessage') ?? '').length}/500
                  </p>
                </div>

                <Separator />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Cancellation Policy</h3>
                  <p className="text-xs text-muted-foreground">Shown to buyers on your dish pages and in their order confirmation. Be clear about refunds and cancellation windows.</p>
                </div>
                <div className="space-y-2">
                  <Label>Cancellation policy <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    placeholder={`e.g. "No refunds within 24 hours of pickup. Contact me ASAP if plans change."`}
                    className="min-h-[80px]"
                    maxLength={500}
                    {...profileForm.register('cancellationPolicy')}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(profileForm.watch('cancellationPolicy') ?? '').length}/500
                  </p>
                </div>
              </>
            )}

            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
