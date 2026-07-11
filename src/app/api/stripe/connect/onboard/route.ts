import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// POST /api/stripe/connect/onboard
// Creates (or reuses) a Stripe Connect Express account and returns an onboarding link
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
    return NextResponse.json({ error: 'Only cooks can set up payouts' }, { status: 403 });
  }

  if (!user.cookProfile) {
    return NextResponse.json({ error: 'Cook profile not found' }, { status: 404 });
  }

  try {
    let stripeAccountId = user.cookProfile.stripeAccountId;

    // Create a new Express account if we don't have one yet
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email ?? undefined,
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      await db.cookProfile.update({
        where: { userId: user.id },
        data: { stripeAccountId },
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://homecooked.app';

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/api/stripe/connect/onboard`,
      return_url: `${baseUrl}/api/stripe/connect/return`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    console.error('[stripe connect onboard]', err);
    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 });
  }
}
