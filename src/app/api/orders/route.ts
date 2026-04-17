import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createOrderSchema = z.object({
  dishId: z.string(),
  quantity: z.number().int().min(1).default(1),
  pickupTime: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

// GET /api/orders — get orders for current user (as buyer or cook)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'cook'

  try {
    const orders = await db.order.findMany({
      where:
        role === 'cook'
          ? { cookId: session.user.id }
          : { buyerId: session.user.id },
      include: {
        dish: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            price: true,
          },
        },
        buyer: { select: { id: true, name: true, image: true } },
        cook: { select: { id: true, name: true, image: true } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('[orders GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/orders — buyer places an order
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dishId, quantity, pickupTime, notes } = parsed.data;

    // Fetch the dish to get price and cookId
    const dish = await db.dish.findUnique({ where: { id: dishId } });
    if (!dish) return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    if (!dish.isAvailable) {
      return NextResponse.json({ error: 'Dish is not currently available' }, { status: 409 });
    }
    if (dish.cookId === session.user.id) {
      return NextResponse.json({ error: 'Cannot order your own dish' }, { status: 400 });
    }

    const totalPrice = dish.price * quantity;

    const order = await db.order.create({
      data: {
        buyerId: session.user.id,
        cookId: dish.cookId,
        dishId,
        quantity,
        totalPrice,
        pickupTime: pickupTime ? new Date(pickupTime) : undefined,
        notes,
        status: 'PENDING',
      },
      include: {
        dish: { select: { id: true, title: true, imageUrl: true } },
        cook: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    console.error('[orders POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
