import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// GET /api/stripe/connect/return
// Called after cook completes Stripe Connect onboarding
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://homecooked.app';
    return NextResponse.redirect(`${baseUrl}/login`);
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://homecooked.app';

  try {
    const cookProfile = await db.cookProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!cookProfile?.stripeAccountId) {
      return NextResponse.redirect(`${baseUrl}/profile/cook?payout=error`);
    }

    const account = await stripe.accounts.retrieve(cookProfile.stripeAccountId);

    const payoutsEnabled =
      account.charges_enabled === true && account.payouts_enabled === true;

    await db.cookProfile.update({
      where: { userId: session.user.id },
      data: { stripePayoutsEnabled: payoutsEnabled },
    });

    return NextResponse.redirect(`${baseUrl}/profile/cook?payout=connected`);
  } catch (err) {
    console.error('[stripe connect return]', err);
    return NextResponse.redirect(`${baseUrl}/profile/cook?payout=error`);
  }
}
