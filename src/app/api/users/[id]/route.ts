import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  image: z.string().url().optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  // Cook profile updates
  cookProfile: z
    .object({
      kitchenName: z.string().optional(),
      description: z.string().optional(),
      cuisineTags: z.array(z.string()).optional(),
      acceptsOrders: z.boolean().optional(),
      instagramHandle: z.string().nullable().optional(),
    })
    .optional(),
});

// GET /api/users/[id] — public profile
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        image: true,
        location: true,
        createdAt: true,
        role: true,
        cookProfile: {
          select: {
            kitchenName: true,
            description: true,
            isVerified: true,
            avgRating: true,
            totalOrders: true,
            cuisineTags: true,
            acceptsOrders: true,
            instagramHandle: true,
          },
        },
        dishesCreated: {
          where: { isAvailable: true },
          select: {
            id: true,
            title: true,
            price: true,
            imageUrl: true,
            category: true,
            _count: { select: { reviews: true } },
          },
          take: 12,
        },
        _count: { select: { reviewsReceived: true } },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error('[user GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id] — update own profile
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.id !== params.id && (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { cookProfile, ...userFields } = parsed.data;

    const updated = await db.user.update({
      where: { id: params.id },
      data: {
        ...userFields,
        ...(cookProfile
          ? {
              cookProfile: {
                update: cookProfile,
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        location: true,
        cookProfile: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('[user PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
