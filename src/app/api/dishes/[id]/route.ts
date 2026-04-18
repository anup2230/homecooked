import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateDishSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  dietary: z.array(z.enum(['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'HALAL', 'KOSHER', 'NUT_FREE', 'DAIRY_FREE'])).optional(),
  serviceType: z.enum(['PREPPED', 'CATERING']).optional(),
  deliveryOptions: z.array(z.enum(['PICKUP', 'DROP_OFF'])).optional(),
  isAvailable: z.boolean().optional(),
  advanceNoticeHrs: z.number().int().min(0).optional(),
  maxOrdersPerDay: z.number().int().positive().optional(),
});

// GET /api/dishes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const dish = await db.dish.findUnique({
      where: { id },
      include: {
        cook: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            lat: true,
            lng: true,
            cookProfile: {
              select: {
                kitchenName: true,
                description: true,
                avgRating: true,
                isVerified: true,
                totalOrders: true,
                cuisineTags: true,
                acceptsOrders: true,
              },
            },
          },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, orders: true } },
      },
    });

    if (!dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    return NextResponse.json({ dish });
  } catch (err) {
    console.error('[dish GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/dishes/[id] — cook updates their dish
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dish = await db.dish.findUnique({ where: { id } });
    if (!dish) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (dish.cookId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateDishSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await db.dish.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ dish: updated });
  } catch (err) {
    console.error('[dish PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/dishes/[id] — cook deletes their dish
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dish = await db.dish.findUnique({ where: { id } });
    if (!dish) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (dish.cookId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.dish.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[dish DELETE]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
