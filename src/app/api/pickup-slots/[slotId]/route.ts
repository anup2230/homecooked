import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateSlotSchema = z.object({
  label: z.string().optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  isActive: z.boolean().optional(),
  maxOrders: z.number().int().positive().optional().nullable(),
});

// PATCH /api/pickup-slots/[slotId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const slot = await db.pickupSlot.findUnique({ where: { id: slotId } });
    if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (slot.cookId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSlotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await db.pickupSlot.update({
      where: { id: slotId },
      data: parsed.data,
    });

    return NextResponse.json({ slot: updated });
  } catch (err) {
    console.error('[pickup-slots PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/pickup-slots/[slotId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  const { slotId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const slot = await db.pickupSlot.findUnique({
      where: { id: slotId },
      include: { orders: { select: { id: true }, take: 1 } },
    });
    if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (slot.cookId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (slot.orders.length > 0) {
      // Soft delete — slot has orders, just deactivate
      await db.pickupSlot.update({ where: { id: slotId }, data: { isActive: false } });
    } else {
      // Hard delete — no orders attached
      await db.pickupSlot.delete({ where: { id: slotId } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[pickup-slots DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
