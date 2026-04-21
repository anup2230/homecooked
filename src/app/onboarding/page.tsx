"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChefHat, MapPin, Clock, ShieldCheck, Utensils,
  Rocket, ArrowRight, ArrowLeft, Loader2, X, Plus,
  CheckCircle2, CalendarClock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Your Kitchen', icon: ChefHat },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Pickup Slots', icon: CalendarClock },
  { id: 4, label: 'Policies', icon: ShieldCheck },
  { id: 5, label: 'First Dish', icon: Utensils },
  { id: 6, label: 'Go Live', icon: Rocket },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CUISINE_OPTIONS = [
  'Mexican', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai',
  'Vietnamese', 'Korean', 'Mediterranean', 'Caribbean', 'West African',
  'Ethiopian', 'Filipino', 'Persian', 'Brazilian', 'Salvadoran',
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Desserts & Baking', 'BBQ',
];

interface PickupSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
}

export default function OnboardingPage() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — identity
  const [kitchenName, setKitchenName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineTags, setCuisineTags] = useState<string[]>([]);
  const [instagramHandle, setInstagramHandle] = useState('');

  // Step 2 — location
  const [neighborhood, setNeighborhood] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoff, setDropoff] = useState(false);
  const [dropoffNotes, setDropoffNotes] = useState('');

  // Step 3 — pickup slots
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [slotDay, setSlotDay] = useState('6');
  const [slotStart, setSlotStart] = useState('14:00');
  const [slotEnd, setSlotEnd] = useState('17:00');
  const [slotLabel, setSlotLabel] = useState('');

  // Step 4 — policies
  const [advanceNotice, setAdvanceNotice] = useState('24');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  // Step 5 — first dish
  const [dishTitle, setDishTitle] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [skipDish, setSkipDish] = useState(false);
  const [isSavingDish, setIsSavingDish] = useState(false);
  const [dishSaved, setDishSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.replace('/login'); return; }
    // Load existing progress
    fetch('/api/onboarding')
      .then(r => r.json())
      .then(data => {
        if (data.cookProfile) {
          const p = data.cookProfile;
          setKitchenName(p.kitchenName ?? '');
          setDescription(p.description ?? '');
          setCuisineTags(p.cuisineTags ?? []);
          setInstagramHandle(p.instagramHandle ?? '');
          setNeighborhood(p.pickupNeighborhood ?? '');
          setPickupAddress(p.pickupAddress ?? '');
          setDropoff(p.dropoffAvailable ?? false);
          setDropoffNotes(p.dropoffNotes ?? '');
          setCancellationPolicy(p.cancellationPolicy ?? '');
          setConfirmationMessage(p.confirmationMessage ?? '');
          if (p.onboardingStep > 0) setStep(Math.min(p.onboardingStep, 6));
        }
        if (data.kitchenApplication?.status) setSubmitted(true);
      })
      .catch(() => {});
  }, [authLoading, isLoggedIn, router]);

  async function saveStep(stepNum: number, extra?: Record<string, unknown>) {
    setIsSaving(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: stepNum,
          kitchenName,
          description,
          cuisineTags,
          instagramHandle: instagramHandle || null,
          pickupNeighborhood: neighborhood || null,
          pickupAddress: pickupAddress || null,
          dropoffAvailable: dropoff,
          dropoffNotes: dropoffNotes || null,
          cancellationPolicy: cancellationPolicy || null,
          confirmationMessage: confirmationMessage || null,
          ...extra,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
    } catch {
      toast({ title: 'Failed to save progress', variant: 'destructive' });
      return false;
    } finally {
      setIsSaving(false);
    }
    return true;
  }

  async function addSlot() {
    if (!slotStart || !slotEnd) return;
    const newSlot: PickupSlot = {
      dayOfWeek: parseInt(slotDay),
      startTime: slotStart,
      endTime: slotEnd,
      label: slotLabel,
    };
    // Save to DB
    try {
      await fetch('/api/pickup-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSlot, label: slotLabel || null }),
      });
      setSlots(prev => [...prev, newSlot]);
      setSlotLabel('');
      toast({ title: 'Slot added!' });
    } catch {
      toast({ title: 'Failed to add slot', variant: 'destructive' });
    }
  }

  async function saveDish() {
    if (!dishTitle || !dishPrice) return;
    setIsSavingDish(true);
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dishTitle,
          description: dishDescription || undefined,
          price: parseFloat(dishPrice),
          serviceType: 'PREPPED',
          deliveryOptions: ['PICKUP'],
        }),
      });
      if (!res.ok) throw new Error('Failed to create dish');
      setDishSaved(true);
      toast({ title: '🍽️ Dish saved!' });
    } catch {
      toast({ title: 'Failed to save dish', variant: 'destructive' });
    } finally {
      setIsSavingDish(false);
    }
  }

  async function handleNext() {
    if (step === 1 && !kitchenName.trim()) {
      toast({ title: 'Kitchen name is required', variant: 'destructive' });
      return;
    }
    if (step === 2 && !neighborhood.trim()) {
      toast({ title: 'Neighborhood is required so buyers can find you', variant: 'destructive' });
      return;
    }
    const ok = await saveStep(step + 1);
    if (ok) setStep(s => s + 1);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await saveStep(6, { acceptsOrders: false });
      const res = await fetch('/api/onboarding/submit', { method: 'POST' });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast({ title: 'Failed to submit application', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function formatTime(t: string) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Submitted state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="container py-16 max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">You're on the list! 🎉</h1>
          <p className="text-muted-foreground mt-2">
            Your kitchen application has been submitted. We'll review it and notify you once you're approved — usually within 24–48 hours.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-sm text-left space-y-2">
          <p className="font-semibold">While you wait, you can:</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>Add more dishes to your menu</li>
            <li>Set up your pickup slots</li>
            <li>Preview your storefront</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/profile/cook">Go to My Kitchen</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/discover">Browse the Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isDone = s.id < step;
            return (
              <div key={s.id} className="flex items-center gap-1">
                <div className={cn(
                  'flex flex-col items-center gap-1',
                  isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-muted-foreground'
                )}>
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors',
                    isActive ? 'border-primary bg-primary text-primary-foreground' :
                    isDone ? 'border-green-600 bg-green-600 text-white' :
                    'border-muted-foreground/30'
                  )}>
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-xs hidden sm:block font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'h-0.5 flex-1 mx-1 mb-4 transition-colors',
                    s.id < step ? 'bg-green-600' : 'bg-muted-foreground/20'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 1: Kitchen Identity ─────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ChefHat className="h-6 w-6 text-primary" /> Your Kitchen
            </CardTitle>
            <CardDescription>Tell buyers who you are and what you cook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Kitchen name <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Abuela's Tamales, The Wok Station"
                value={kitchenName}
                onChange={e => setKitchenName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>About your kitchen <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                placeholder="Share your story — what inspires your cooking, your background, what makes your food special..."
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cuisine tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {CUISINE_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setCuisineTags(prev =>
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    )}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm border transition-colors',
                      cuisineTags.includes(tag)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-muted hover:border-primary/50'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Instagram <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                placeholder="@yourhandle"
                value={instagramHandle}
                onChange={e => setInstagramHandle(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Location ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MapPin className="h-6 w-6 text-primary" /> Location & Pickup
            </CardTitle>
            <CardDescription>
              Your neighborhood is shown publicly. Your full address is only shared after an order is confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Neighborhood <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Mission District, SF · East LA · Bushwick, Brooklyn"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">This is shown publicly on your listings.</p>
            </div>
            <div className="space-y-2">
              <Label>Full pickup address <span className="text-muted-foreground">(optional now)</span></Label>
              <Input
                placeholder="123 Main St, City, State"
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shared with buyers only after they place an order.</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Offer drop-off?</p>
                <p className="text-xs text-muted-foreground">Let buyers know you can deliver within a radius.</p>
              </div>
              <Switch checked={dropoff} onCheckedChange={setDropoff} />
            </div>
            {dropoff && (
              <div className="space-y-2">
                <Label>Drop-off details</Label>
                <Input
                  placeholder="e.g. Within 3 miles, $5 fee. Contact me to arrange."
                  value={dropoffNotes}
                  onChange={e => setDropoffNotes(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Pickup Slots ──────────────────────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarClock className="h-6 w-6 text-primary" /> Pickup Slots
            </CardTitle>
            <CardDescription>
              Set your available pickup windows. Buyers will choose one when ordering.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Existing slots */}
            {slots.length > 0 && (
              <div className="space-y-2">
                {slots.map((slot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-sm">
                    <span>
                      <span className="font-medium">{DAYS[slot.dayOfWeek]}</span>{' '}
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      {slot.label && <span className="text-muted-foreground"> · {slot.label}</span>}
                    </span>
                    <button onClick={() => setSlots(prev => prev.filter((_, j) => j !== i))}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add slot form */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <p className="text-sm font-medium">Add a slot</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <select
                    value={slotDay}
                    onChange={e => setSlotDay(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Label (optional)</Label>
                  <Input
                    placeholder="e.g. Weekend afternoon"
                    value={slotLabel}
                    onChange={e => setSlotLabel(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start time</Label>
                  <Input type="time" value={slotStart} onChange={e => setSlotStart(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End time</Label>
                  <Input type="time" value={slotEnd} onChange={e => setSlotEnd(e.target.value)} />
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={addSlot}>
                <Plus className="h-4 w-4 mr-1" /> Add Slot
              </Button>
            </div>

            {slots.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No slots yet — you can skip and add them later from your dashboard.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Policies ─────────────────────────────────────────────────── */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-6 w-6 text-primary" /> Policies
            </CardTitle>
            <CardDescription>Set expectations for your buyers upfront.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Advance notice required</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="0"
                  className="w-28"
                  value={advanceNotice}
                  onChange={e => setAdvanceNotice(e.target.value)}
                />
                <span className="text-sm text-muted-foreground">hours before pickup</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {parseInt(advanceNotice) >= 24
                  ? `Buyers must order at least ${Math.round(parseInt(advanceNotice) / 24)} day(s) in advance.`
                  : parseInt(advanceNotice) > 0
                  ? `Buyers must order at least ${advanceNotice} hours in advance.`
                  : 'Buyers can order anytime.'}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Cancellation policy <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                placeholder="e.g. No refunds within 24 hours of pickup. Contact me ASAP if plans change."
                rows={2}
                value={cancellationPolicy}
                onChange={e => setCancellationPolicy(e.target.value)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Auto-message to buyer on confirmation <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                placeholder="e.g. Hi! Your order is confirmed. I'll have it ready at the pickup address. See you then!"
                rows={2}
                value={confirmationMessage}
                onChange={e => setConfirmationMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Sent automatically when you confirm an order.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: First Dish ────────────────────────────────────────────────── */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Utensils className="h-6 w-6 text-primary" /> Your First Dish
            </CardTitle>
            <CardDescription>Add at least one dish to start taking orders. You can add more later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {dishSaved ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                <p className="font-medium">"{dishTitle}" saved!</p>
                <p className="text-sm text-muted-foreground">You can add more dishes from your kitchen dashboard.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Dish name <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="e.g. Chicken Tamales (dozen), Pad Thai, Jollof Rice"
                    value={dishTitle}
                    onChange={e => setDishTitle(e.target.value)}
                    disabled={skipDish}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    placeholder="What's in it? What makes it special?"
                    rows={2}
                    value={dishDescription}
                    onChange={e => setDishDescription(e.target.value)}
                    disabled={skipDish}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price <span className="text-destructive">*</span></Label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-7"
                      value={dishPrice}
                      onChange={e => setDishPrice(e.target.value)}
                      disabled={skipDish}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={saveDish}
                    disabled={!dishTitle || !dishPrice || isSavingDish || skipDish}
                  >
                    {isSavingDish ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save Dish
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSkipDish(true)}
                  >
                    Skip for now
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 6: Go Live ───────────────────────────────────────────────────── */}
      {step === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="h-6 w-6 text-primary" /> Almost there!
            </CardTitle>
            <CardDescription>
              Submit your kitchen for review. Once approved, you'll go live on the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
              <p className="font-semibold">Your kitchen summary</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Kitchen name</span>
                <span className="font-medium text-foreground">{kitchenName || '—'}</span>
                <span>Neighborhood</span>
                <span className="font-medium text-foreground">{neighborhood || '—'}</span>
                <span>Cuisine</span>
                <span className="font-medium text-foreground">
                  {cuisineTags.length > 0 ? cuisineTags.slice(0, 3).join(', ') : '—'}
                </span>
                <span>Pickup slots</span>
                <span className="font-medium text-foreground">{slots.length} set</span>
                <span>Advance notice</span>
                <span className="font-medium text-foreground">{advanceNotice}h</span>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-4 text-sm space-y-1">
              <p className="font-semibold text-blue-800 dark:text-blue-300">What happens next</p>
              <ul className="text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>We'll review your kitchen within 24–48 hours</li>
                <li>You'll get notified when you're approved</li>
                <li>Your profile stays in draft mode until then</li>
                <li>You can keep adding dishes and setting up your menu</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || !kitchenName || !neighborhood}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Submit Kitchen for Review
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/profile/cook" className="underline">
                Go to your dashboard
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1 || isSaving}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {step < 6 && (
          <Button onClick={handleNext} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {step === 5 ? 'Continue' : 'Save & Continue'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
