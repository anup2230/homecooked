import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const schema = z.object({
  orderId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: parsed.data.orderId },
      include: {
        dish: { select: { title: true } },
        cook: { include: { cookProfile: { select: { stripeAccountId: true, stripePayoutsEnabled: true } } } },
      },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order is not in a payable state' }, { status: 409 });
    }

    const amountCents = Math.round(order.totalPrice * 100);
    const cookStripeAccountId = order.cook?.cookProfile?.stripeAccountId;
    const cookPayoutsEnabled = order.cook?.cookProfile?.stripePayoutsEnabled;

    // 10% platform fee
    const applicationFeeCents = Math.round(amountCents * 0.10);

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency: 'usd',
      metadata: {
        orderId: order.id,
        buyerId: order.buyerId,
        cookId: order.cookId,
        hasTransfer: cookStripeAccountId && cookPayoutsEnabled ? 'true' : 'false',
      },
      description: `Homecooked order: ${order.dish.title}`,
    };

    // Wire funds to cook's Stripe Express account if they've completed Connect onboarding
    if (cookStripeAccountId && cookPayoutsEnabled) {
      paymentIntentParams.transfer_data = { destination: cookStripeAccountId };
      paymentIntentParams.application_fee_amount = applicationFeeCents;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[create-payment-intent]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
