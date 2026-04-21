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
      pickupNeighborhood: z.string().nullable().optional(),
      pickupAddress: z.string().nullable().optional(),
      dropoffAvailable: z.boolean().optional(),
      dropoffNotes: z.string().nullable().optional(),
      confirmationMessage: z.string().max(500).nullable().optional(),
      cancellationPolicy: z.string().max(500).nullable().optional(),
    })
    .optional(),
});

// GET /api/users/[id] — public profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await db.user.findUnique({
      where: { id },
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
            isDraft: true,
            onboardingStep: true,
            avgRating: true,
            totalOrders: true,
            cuisineTags: true,
            acceptsOrders: true,
            instagramHandle: true,
            pickupNeighborhood: true,
            dropoffAvailable: true,
            dropoffNotes: true,
            confirmationMessage: true,
            cancellationPolicy: true,
            // pickupAddress intentionally omitted — only returned post-order
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.id !== id && (session.user as any).role !== 'ADMIN') {
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
      where: { id },
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
