import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createDishSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  category: z.string().optional(),
  cuisineTag: z.string().optional(),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  dietary: z.array(z.enum(['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'HALAL', 'KOSHER', 'NUT_FREE', 'DAIRY_FREE'])).default([]),
  serviceType: z.enum(['PREPPED', 'CATERING']).default('PREPPED'),
  deliveryOptions: z.array(z.enum(['PICKUP', 'DROP_OFF'])).default(['PICKUP']),
  advanceNoticeHrs: z.number().int().min(0).default(24),
  maxOrdersPerDay: z.number().int().positive().optional(),
});

// GET /api/dishes — browse all available dishes with optional filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const serviceType = searchParams.get('serviceType') || '';
  const delivery = searchParams.get('delivery') || '';
  const cookId = searchParams.get('cookId') || '';
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const dishes = await db.dish.findMany({
      where: {
        // If cookId filter present (e.g. cook's own dashboard), show all their dishes incl. hidden.
        // Otherwise only show available dishes to the public.
        ...(cookId ? { cookId } : { isAvailable: true }),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { cook: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
        ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
        ...(serviceType ? { serviceType: serviceType as any } : {}),
        ...(delivery ? { deliveryOptions: { has: delivery as any } } : {}),
        ...(minPrice !== undefined ? { price: { gte: minPrice } } : {}),
        ...(maxPrice !== undefined ? { price: { lte: maxPrice } } : {}),
      },
      include: {
        cook: {
          select: {
            id: true,
            name: true,
            image: true,
            location: true,
            cookProfile: {
              select: {
                kitchenName: true,
                avgRating: true,
                isVerified: true,
              },
            },
          },
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.dish.count({ where: { isAvailable: true } });

    return NextResponse.json({ dishes, total, page, limit });
  } catch (err) {
    console.error('[dishes GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/dishes — cook creates a new dish listing
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if ((session.user as any).role !== 'COOK') {
    return NextResponse.json({ error: 'Only cooks can create dishes' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createDishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const dish = await db.dish.create({
      data: {
        ...parsed.data,
        cookId: session.user.id,
      },
    });

    return NextResponse.json({ dish }, { status: 201 });
  } catch (err) {
    console.error('[dishes POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
