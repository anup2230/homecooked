"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, Clock, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface PickupSlot {
  id: string;
  label: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  maxOrders: number | null;
  ordersThisWeek: number;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function PickupSlotsPage() {
  const { user, isCook, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newDay, setNewDay] = useState('6'); // Saturday default
  const [newStart, setNewStart] = useState('14:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [newLabel, setNewLabel] = useState('');
  const [newMax, setNewMax] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.replace('/login'); return; }
    if (!isCook) { router.replace('/profile/cook'); return; }
  }, [authLoading, isLoggedIn, isCook, router]);

  useEffect(() => {
    if (!user?.id) return;
    fetchSlots();
  }, [user?.id]);

  async function fetchSlots() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pickup-slots?cookId=${user?.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSlots(data.slots);
    } catch {
      toast({ title: 'Failed to load slots', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddSlot() {
    if (!newStart || !newEnd) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/pickup-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: parseInt(newDay),
          startTime: newStart,
          endTime: newEnd,
          label: newLabel || null,
          maxOrders: newMax ? parseInt(newMax) : null,
        }),
      });
      if (!res.ok) throw new Error();
      toast({ title: 'Slot added!' });
      setShowForm(false);
      setNewLabel('');
      setNewMax('');
      fetchSlots();
    } catch {
      toast({ title: 'Failed to add slot', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleSlot(slotId: string, isActive: boolean) {
    try {
      await fetch(`/api/pickup-slots/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      setSlots(prev => prev.map(s => s.id === slotId ? { ...s, isActive } : s));
    } catch {
      toast({ title: 'Failed to update slot', variant: 'destructive' });
    }
  }

  async function deleteSlot(slotId: string) {
    try {
      await fetch(`/api/pickup-slots/${slotId}`, { method: 'DELETE' });
      setSlots(prev => prev.filter(s => s.id !== slotId));
      toast({ title: 'Slot removed' });
    } catch {
      toast({ title: 'Failed to delete slot', variant: 'destructive' });
    }
  }

  // Group by day
  const byDay = DAYS.map((day, i) => ({
    day,
    dayIndex: i,
    slots: slots.filter(s => s.dayOfWeek === i),
  })).filter(g => g.slots.length > 0);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/profile/cook">
            <ChevronLeft className="h-4 w-4 mr-1" /> Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" /> Pickup Slots
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Set your available pickup windows so buyers can choose a time when ordering.
          </p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="h-4 w-4 mr-2" /> Add Slot
        </Button>
      </div>

      {/* Add slot form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Pickup Slot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Day of week</Label>
                <Select value={newDay} onValueChange={setNewDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Label <span className="text-muted-foreground">(optional)</span></Label>
                <Input placeholder="e.g. Weekend morning" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start time</Label>
                <Input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>End time</Label>
                <Input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1 max-w-xs">
              <Label>Max orders per slot <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="number" min="1" placeholder="Unlimited" value={newMax} onChange={e => setNewMax(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddSlot} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Slot
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing slots */}
      {byDay.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p>No pickup slots yet.</p>
            <p className="text-sm mt-1">Add your first slot so buyers know when to pick up.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {byDay.map(({ day, slots: daySlots }) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {daySlots.map(slot => (
                  <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        {slot.label && <span className="text-muted-foreground ml-2">· {slot.label}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {slot.ordersThisWeek} order{slot.ordersThisWeek !== 1 ? 's' : ''} this week
                        {slot.maxOrders ? ` / ${slot.maxOrders} max` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={slot.isActive}
                        onCheckedChange={val => toggleSlot(slot.id, val)}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSlot(slot.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
