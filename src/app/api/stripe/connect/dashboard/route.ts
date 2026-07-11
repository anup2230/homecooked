import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// POST /api/stripe/connect/dashboard
// Returns a Stripe Express dashboard login link
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { cookProfile: true },
  });

  if (!user || user.role !== 'COOK') {
    return NextResponse.json({ error: 'Only cooks can access the payout dashboard' }, { status: 403 });
  }

  if (!user.cookProfile?.stripeAccountId) {
    return NextResponse.json({ error: 'Stripe Connect not set up yet' }, { status: 400 });
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(
      user.cookProfile.stripeAccountId
    );
    return NextResponse.json({ url: loginLink.url });
  } catch (err) {
    console.error('[stripe connect dashboard]', err);
    return NextResponse.json({ error: 'Failed to create dashboard link' }, { status: 500 });
  }
}
