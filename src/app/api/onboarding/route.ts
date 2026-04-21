import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const onboardingSchema = z.object({
  step: z.number().int().min(1).max(6),
  // Step 1 — identity
  kitchenName: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  cuisineTags: z.array(z.string()).optional(),
  instagramHandle: z.string().nullable().optional(),
  // Step 2 — location
  pickupNeighborhood: z.string().nullable().optional(),
  pickupAddress: z.string().nullable().optional(),
  dropoffAvailable: z.boolean().optional(),
  dropoffNotes: z.string().nullable().optional(),
  // Step 4 — policies
  advanceNoticeHrs: z.number().int().min(0).optional(),
  cancellationPolicy: z.string().max(500).nullable().optional(),
  confirmationMessage: z.string().max(500).nullable().optional(),
  // Step 6 — go live
  acceptsOrders: z.boolean().optional(),
});

// POST /api/onboarding — save progress and advance step
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { step, ...fields } = parsed.data;

    // Upsert the CookProfile with whatever fields came in
    // Also update the user's role to COOK if not already
    await db.user.update({
      where: { id: session.user.id },
      data: { role: 'COOK' },
    });

    const cookProfile = await db.cookProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        kitchenName: fields.kitchenName ?? 'My Kitchen',
        description: fields.description,
        cuisineTags: fields.cuisineTags ?? [],
        instagramHandle: fields.instagramHandle,
        pickupNeighborhood: fields.pickupNeighborhood,
        pickupAddress: fields.pickupAddress,
        dropoffAvailable: fields.dropoffAvailable ?? false,
        dropoffNotes: fields.dropoffNotes,
        cancellationPolicy: fields.cancellationPolicy,
        confirmationMessage: fields.confirmationMessage,
        acceptsOrders: fields.acceptsOrders ?? false,
        isDraft: true,
        onboardingStep: step,
      },
      update: {
        ...(fields.kitchenName !== undefined && { kitchenName: fields.kitchenName }),
        ...(fields.description !== undefined && { description: fields.description }),
        ...(fields.cuisineTags !== undefined && { cuisineTags: fields.cuisineTags }),
        ...(fields.instagramHandle !== undefined && { instagramHandle: fields.instagramHandle }),
        ...(fields.pickupNeighborhood !== undefined && { pickupNeighborhood: fields.pickupNeighborhood }),
        ...(fields.pickupAddress !== undefined && { pickupAddress: fields.pickupAddress }),
        ...(fields.dropoffAvailable !== undefined && { dropoffAvailable: fields.dropoffAvailable }),
        ...(fields.dropoffNotes !== undefined && { dropoffNotes: fields.dropoffNotes }),
        ...(fields.cancellationPolicy !== undefined && { cancellationPolicy: fields.cancellationPolicy }),
        ...(fields.confirmationMessage !== undefined && { confirmationMessage: fields.confirmationMessage }),
        ...(fields.acceptsOrders !== undefined && { acceptsOrders: fields.acceptsOrders }),
        onboardingStep: step,
      },
    });

    return NextResponse.json({ cookProfile });
  } catch (err) {
    console.error('[onboarding POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/onboarding — get current onboarding state
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cookProfile = await db.cookProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        kitchenName: true,
        description: true,
        cuisineTags: true,
        instagramHandle: true,
        pickupNeighborhood: true,
        pickupAddress: true,
        dropoffAvailable: true,
        dropoffNotes: true,
        cancellationPolicy: true,
        confirmationMessage: true,
        acceptsOrders: true,
        isDraft: true,
        isVerified: true,
        onboardingStep: true,
      },
    });

    const kitchenApplication = await db.kitchenApplication.findUnique({
      where: { userId: session.user.id },
      select: { status: true, createdAt: true },
    });

    return NextResponse.json({ cookProfile, kitchenApplication });
  } catch (err) {
    console.error('[onboarding GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
