import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createSlotSchema = z.object({
  label: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  maxOrders: z.number().int().positive().optional().nullable(),
});

// GET /api/pickup-slots?cookId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cookId = searchParams.get('cookId');

  if (!cookId) {
    return NextResponse.json({ error: 'cookId is required' }, { status: 400 });
  }

  try {
    const slots = await db.pickupSlot.findMany({
      where: { cookId, isActive: true },
      include: {
        orders: {
          where: {
            createdAt: {
              // Current week: Mon–Sun
              gte: getWeekStart(),
              lt: getWeekEnd(),
            },
          },
          select: { id: true },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    const slotsWithCount = slots.map((slot) => ({
      ...slot,
      ordersThisWeek: slot.orders.length,
      orders: undefined, // strip raw orders from response
    }));

    return NextResponse.json({ slots: slotsWithCount });
  } catch (err) {
    console.error('[pickup-slots GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/pickup-slots — create a slot (cooks only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'COOK' && user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only cooks can create pickup slots' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createSlotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const slot = await db.pickupSlot.create({
      data: {
        cookId: session.user.id,
        ...parsed.data,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (err) {
    console.error('[pickup-slots POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekEnd(): Date {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return end;
}
