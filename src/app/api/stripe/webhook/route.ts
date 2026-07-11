import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { orderPlacedSubject, orderPlacedHtml } from '@/lib/emails/orderPlaced';
import { orderConfirmedSubject, orderConfirmedHtml } from '@/lib/emails/orderConfirmed';
import { orderConfirmedCookSubject, orderConfirmedCookHtml } from '@/lib/emails/orderConfirmedCook';
import { orderCancelledSubject, orderCancelledHtml } from '@/lib/emails/orderCancelled';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

// Stripe requires raw body for webhook signature verification
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('[stripe webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;

        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: {
              status: 'CONFIRMED',
              stripePaymentIntentId: paymentIntent.id,
            },
          });

          // Fetch full order details for emails and cook stat increment
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: {
              dish: { select: { title: true } },
              buyer: { select: { name: true, email: true } },
              cook: {
                select: {
                  name: true,
                  email: true,
                  cookProfile: {
                    select: {
                      kitchenName: true,
                      confirmationMessage: true,
                      pickupAddress: true,
                    },
                  },
                },
              },
            },
          });

          if (order) {
            // Increment cook's total orders
            await db.cookProfile.update({
              where: { userId: order.cookId },
              data: { totalOrders: { increment: 1 } },
            });

            // Email buyer: order confirmed
            if (order.buyer.email) {
              await sendEmail({
                to: order.buyer.email,
                subject: orderConfirmedSubject(order.cook.name ?? 'Your cook'),
                html: orderConfirmedHtml({
                  buyerName: order.buyer.name ?? 'there',
                  cookName: order.cook.name ?? 'Your cook',
                  dishTitle: order.dish.title,
                  pickupAddress: order.cook.cookProfile?.pickupAddress,
                  pickupTime: order.pickupTime ? order.pickupTime.toLocaleString() : null,
                  confirmationMessage: order.cook.cookProfile?.confirmationMessage,
                }),
              });
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await db.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
          });

          // Email buyer about cancellation due to payment failure
          const order = await db.order.findUnique({
            where: { id: orderId },
            include: {
              dish: { select: { title: true } },
              buyer: { select: { name: true, email: true } },
              cook: { select: { name: true } },
            },
          });
          if (order?.buyer.email) {
            await sendEmail({
              to: order.buyer.email,
              subject: orderCancelledSubject(),
              html: orderCancelledHtml({
                buyerName: order.buyer.name ?? 'there',
                dishTitle: order.dish.title,
                cookName: order.cook.name ?? 'the cook',
                totalPrice: order.totalPrice,
              }),
            });
          }
        }
        break;
      }

      default:
        console.log(`[stripe webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('[stripe webhook] Handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
