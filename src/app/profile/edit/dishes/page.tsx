"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/image-upload';
import { Loader2, Plus, Trash2, ChefHat, Clock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface PickupSlotDraft {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
  maxOrders: string;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const addDishSchema = z.object({
  title: z.string().min(3, 'Dish name must be at least 3 characters'),
  description: z.string().min(10, 'Add a brief description (10+ chars)'),
  price: z.coerce.number().positive('Price must be positive'),
  category: z.string().optional(),
  serviceType: z.enum(['PREPPED', 'CATERING']).default('PREPPED'),
  imageUrl: z.string().url().optional(),
  advanceNoticeHrs: z.coerce.number().int().min(0).default(24),
  totalServings: z.coerce.number().int().positive().optional(),
});

type AddDishForm = z.infer<typeof addDishSchema>;

interface Dish {
  id: string;
  title: string;
  price: number;
  isAvailable: boolean;
  category: string | null;
  totalServings: number | null;
  pickupSlots?: { id: string; dayOfWeek: number; startTime: string; endTime: string; label: string | null }[];
}

export default function EditDishesPage() {
  const { user, isCook, isLoggedIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDishImageUrl, setNewDishImageUrl] = useState<string | null>(null);

  const [pickupSlots, setPickupSlots] = useState<PickupSlotDraft[]>([]);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotDay, setSlotDay] = useState('6');
  const [slotStart, setSlotStart] = useState('10:00');
  const [slotEnd, setSlotEnd] = useState('12:00');
  const [slotLabel, setSlotLabel] = useState('');
  const [slotMax, setSlotMax] = useState('');

  const dishForm = useForm<AddDishForm>({
    resolver: zodResolver(addDishSchema),
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    if (!isCook) {
      router.replace('/profile/edit');
      return;
    }
    if (user?.id) {
      setIsLoadingDishes(true);
      fetch(`/api/dishes?cookId=${user.id}&limit=50`)
        .then(r => r.json())
        .then(data => setDishes(data.dishes ?? []))
        .finally(() => setIsLoadingDishes(false));
    }
  }, [isLoggedIn, isCook, user?.id]);

  const addPickupSlot = () => {
    if (!slotStart || !slotEnd) return;
    setPickupSlots(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      dayOfWeek: parseInt(slotDay),
      startTime: slotStart,
      endTime: slotEnd,
      label: slotLabel,
      maxOrders: slotMax,
    }]);
    setSlotLabel('');
    setSlotMax('');
    setShowSlotForm(false);
  };

  const removePickupSlot = (id: string) => {
    setPickupSlots(prev => prev.filter(s => s.id !== id));
  };

  const resetDishForm = () => {
    dishForm.reset();
    setNewDishImageUrl(null);
    setPickupSlots([]);
    setShowSlotForm(false);
    setShowAddDish(false);
  };

  const onAddDish = async (data: AddDishForm) => {
    setIsAddingDish(true);
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          imageUrl: newDishImageUrl ?? undefined,
          deliveryOptions: ['PICKUP'],
          advanceNoticeHrs: data.advanceNoticeHrs ?? 24,
          totalServings: data.totalServings || undefined,
          pickupSlots: pickupSlots.map(s => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            label: s.label || undefined,
            maxOrders: s.maxOrders ? parseInt(s.maxOrders) : undefined,
          })),
        }),
      });
      if (!res.ok) throw new Error('Failed to add dish');
      const { dish } = await res.json();
      setDishes(prev => [dish, ...prev]);
      resetDishForm();
      toast({ title: `"${dish.title}" added ✓` });
    } catch {
      toast({ title: 'Failed to add dish', variant: 'destructive' });
    } finally {
      setIsAddingDish(false);
    }
  };

  const toggleDishAvailability = async (dishId: string, isAvailable: boolean) => {
    try {
      await fetch(`/api/dishes/${dishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });
      setDishes(prev =>
        prev.map(d => (d.id === dishId ? { ...d, isAvailable } : d))
      );
    } catch {
      toast({ title: 'Failed to update dish', variant: 'destructive' });
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/profile/edit">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Edit Profile
            </Link>
          </Button>
          <h1 className="text-2xl font-bold font-headline">Your Dishes</h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/profile/${user?.id}`}>View Profile</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Menu</CardTitle>
            <CardDescription>Manage your dish listings.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddDish(v => !v)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Dish
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Dish Form */}
          {showAddDish && (
            <Card className="border-dashed">
              <CardContent className="pt-4">
                <form onSubmit={dishForm.handleSubmit(onAddDish)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label>Dish Photo</Label>
                      <ImageUpload
                        folder="dishes"
                        value={newDishImageUrl}
                        onUpload={(url) => setNewDishImageUrl(url)}
                        onRemove={() => setNewDishImageUrl(null)}
                        aspectRatio="aspect-video"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Dish Name</Label>
                      <Input placeholder="Nonna's Meatballs" {...dishForm.register('title')} />
                      {dishForm.formState.errors.title && (
                        <p className="text-xs text-destructive">{dishForm.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Price ($)</Label>
                      <Input type="number" step="0.01" placeholder="18.00" {...dishForm.register('price')} />
                      {dishForm.formState.errors.price && (
                        <p className="text-xs text-destructive">{dishForm.formState.errors.price.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Input placeholder="Italian" {...dishForm.register('category')} />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Description</Label>
                      <Textarea placeholder="What makes this dish special?" {...dishForm.register('description')} />
                      {dishForm.formState.errors.description && (
                        <p className="text-xs text-destructive">{dishForm.formState.errors.description.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Order Cutoff (hours in advance)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="24"
                        {...dishForm.register('advanceNoticeHrs')}
                      />
                      <p className="text-xs text-muted-foreground">How many hours before pickup must orders be placed? (0 = anytime)</p>
                      {dishForm.formState.errors.advanceNoticeHrs && (
                        <p className="text-xs text-destructive">{dishForm.formState.errors.advanceNoticeHrs.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Total Servings Available</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Unlimited"
                        {...dishForm.register('totalServings')}
                      />
                      <p className="text-xs text-muted-foreground">Leave blank for unlimited.</p>
                    </div>
                  </div>

                  {/* Pickup Slots */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Pickup Times
                        </p>
                        <p className="text-xs text-muted-foreground">Add specific pickup windows for this dish.</p>
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowSlotForm(v => !v)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Time
                      </Button>
                    </div>

                    {showSlotForm && (
                      <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Day</Label>
                            <Select value={slotDay} onValueChange={setSlotDay}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {DAYS.map((d, i) => (
                                  <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label (optional)</Label>
                            <Input className="h-8 text-xs" placeholder="e.g. Weekend morning" value={slotLabel} onChange={e => setSlotLabel(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Start time</Label>
                            <Input className="h-8 text-xs" type="time" value={slotStart} onChange={e => setSlotStart(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">End time</Label>
                            <Input className="h-8 text-xs" type="time" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-1 max-w-[160px]">
                          <Label className="text-xs">Max orders per slot</Label>
                          <Input className="h-8 text-xs" type="number" min="1" placeholder="Unlimited" value={slotMax} onChange={e => setSlotMax(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" onClick={addPickupSlot}>Save Slot</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setShowSlotForm(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}

                    {pickupSlots.length > 0 && (
                      <div className="space-y-1">
                        {pickupSlots.map(slot => (
                          <div key={slot.id} className="flex items-center justify-between text-xs p-2 rounded-md border bg-background">
                            <span className="font-medium">{DAYS[slot.dayOfWeek]}</span>
                            <span className="text-muted-foreground">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}{slot.label ? ` · ${slot.label}` : ''}</span>
                            {slot.maxOrders && <span className="text-muted-foreground">max {slot.maxOrders}</span>}
                            <button type="button" onClick={() => removePickupSlot(slot.id)} className="text-muted-foreground hover:text-destructive ml-1">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isAddingDish}>
                      {isAddingDish ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Add Dish
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={resetDishForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Dishes list */}
          {isLoadingDishes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : dishes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No dishes yet. Add your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dishes.map(dish => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{dish.title}</p>
                    <p className="text-sm text-muted-foreground">
                      ${dish.price.toFixed(2)}
                      {dish.category ? ` · ${dish.category}` : ''}
                      {dish.totalServings ? ` · ${dish.totalServings} servings` : ''}
                    </p>
                    {dish.pickupSlots && dish.pickupSlots.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dish.pickupSlots.length} pickup slot{dish.pickupSlots.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={dish.isAvailable}
                        onCheckedChange={val => toggleDishAvailability(dish.id, val)}
                      />
                      <span className="text-muted-foreground">
                        {dish.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
