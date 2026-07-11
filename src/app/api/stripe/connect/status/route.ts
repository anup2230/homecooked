import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/stripe/connect/status
// Returns cook's Stripe Connect status
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cookProfile = await db.cookProfile.findUnique({
      where: { userId: session.user.id },
      select: { stripeAccountId: true, stripePayoutsEnabled: true },
    });

    if (!cookProfile) {
      return NextResponse.json({ error: 'Cook profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      stripeAccountId: cookProfile.stripeAccountId,
      stripePayoutsEnabled: cookProfile.stripePayoutsEnabled,
    });
  } catch (err) {
    console.error('[stripe connect status]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
