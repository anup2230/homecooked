import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const submitSchema = z.object({
  kitchenName: z.string().min(2),
  description: z.string().optional(),
});

// POST /api/onboarding/submit — submit kitchen application
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cookProfile = await db.cookProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!cookProfile) {
      return NextResponse.json({ error: 'Complete onboarding first' }, { status: 400 });
    }

    // Check if already submitted
    const existing = await db.kitchenApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ application: existing });
    }

    const application = await db.kitchenApplication.create({
      data: {
        userId: session.user.id,
        kitchenName: cookProfile.kitchenName,
        description: cookProfile.description,
        cuisineTags: cookProfile.cuisineTags,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (err) {
    console.error('[onboarding/submit POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
