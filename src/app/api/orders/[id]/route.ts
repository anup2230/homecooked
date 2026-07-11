import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { orderConfirmedSubject, orderConfirmedHtml } from '@/lib/emails/orderConfirmed';
import { orderCancelledSubject, orderCancelledHtml } from '@/lib/emails/orderCancelled';
import { orderReadySubject, orderReadyHtml } from '@/lib/emails/orderReady';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

const patchOrderSchema = z.object({
  pickupSlotId: z.string().nullable(),
});

// GET /api/orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await db.order.findUnique({
      where: { id },
      include: {
        dish: true,
        buyer: { select: { id: true, name: true, image: true, email: true } },
        cook: {
          select: {
            id: true,
            name: true,
            image: true,
            cookProfile: {
              select: {
                kitchenName: true,
                pickupNeighborhood: true,
                pickupAddress: true,  // returned below only when order is confirmed+
                dropoffAvailable: true,
                dropoffNotes: true,
              },
            },
          },
        },
        messages: {
          include: { sender: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: 'asc' },
        },
        review: true,
      },
    });

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only buyer or cook on the order can view it
    if (order.buyerId !== session.user.id && order.cookId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Redact full pickup address for buyers until order is confirmed
    const pendingStatuses = ['PENDING'];
    const isBuyer = order.buyerId === session.user.id;
    if (isBuyer && pendingStatuses.includes(order.status) && order.cook?.cookProfile) {
      (order.cook.cookProfile as any).pickupAddress = null;
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error('[order GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — update pickup slot
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const isBuyer = order.buyerId === session.user.id;
    const isCook = order.cookId === session.user.id;
    if (!isBuyer && !isCook) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = patchOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    // Verify the slot belongs to this order's cook
    if (parsed.data.pickupSlotId) {
      const slot = await db.pickupSlot.findUnique({ where: { id: parsed.data.pickupSlotId } });
      if (!slot || slot.cookId !== order.cookId) {
        return NextResponse.json({ error: 'Invalid pickup slot' }, { status: 400 });
      }
    }

    const updated = await db.order.update({
      where: { id },
      data: { pickupSlotId: parsed.data.pickupSlotId },
    });

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error('[order PATCH]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/orders/[id] — update order status (cook confirms/updates, buyer cancels)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { status } = parsed.data;
    const userId = session.user.id;

    // Permission rules:
    // - Cook can: CONFIRM, PREPARING, READY, COMPLETED
    // - Buyer can: CANCELLED (only if PENDING)
    const isCook = order.cookId === userId;
    const isBuyer = order.buyerId === userId;

    if (!isCook && !isBuyer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isBuyer && status !== 'CANCELLED' && status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'Buyers can only cancel or confirm orders' }, { status: 403 });
    }

    // Buyers can only confirm PENDING orders (dev/simple flow — no payment gate)
    if (isBuyer && status === 'CONFIRMED' && order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only confirm pending orders' }, { status: 409 });
    }

    if (isBuyer && status === 'CANCELLED' && order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending orders' },
        { status: 409 }
      );
    }

    const updated = await db.order.update({
      where: { id },
      data: { status },
    });

    // Fetch full details needed for emails / refunds
    const fullOrder = await db.order.findUnique({
      where: { id },
      include: {
        dish: { select: { title: true } },
        buyer: { select: { name: true, email: true } },
        cook: {
          select: {
            name: true,
            phone: true,
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

    // Auto-send cook's default confirmation message to buyer on confirm
    if (isCook && status === 'CONFIRMED') {
      const cookProfile = await db.cookProfile.findUnique({
        where: { userId: order.cookId },
        select: { confirmationMessage: true },
      });
      if (cookProfile?.confirmationMessage) {
        await db.message.create({
          data: {
            senderId: order.cookId,
            recipientId: order.buyerId,
            body: cookProfile.confirmationMessage,
            orderId: id,
          },
        });
      }

      // Email buyer: order confirmed
      if (fullOrder?.buyer.email) {
        await sendEmail({
          to: fullOrder.buyer.email,
          subject: orderConfirmedSubject(fullOrder.cook.name ?? 'Your cook'),
          html: orderConfirmedHtml({
            buyerName: fullOrder.buyer.name ?? 'there',
            cookName: fullOrder.cook.name ?? 'Your cook',
            dishTitle: fullOrder.dish.title,
            pickupAddress: fullOrder.cook.cookProfile?.pickupAddress,
            pickupTime: fullOrder.pickupTime ? fullOrder.pickupTime.toLocaleString() : null,
            confirmationMessage: fullOrder.cook.cookProfile?.confirmationMessage,
          }),
        });
      }
    }

    // Email buyer: order ready for pickup
    if (isCook && status === 'READY' && fullOrder?.buyer.email) {
      await sendEmail({
        to: fullOrder.buyer.email,
        subject: orderReadySubject(),
        html: orderReadyHtml({
          buyerName: fullOrder.buyer.name ?? 'there',
          dishTitle: fullOrder.dish.title,
          cookName: fullOrder.cook.name ?? 'Your cook',
          pickupAddress: fullOrder.cook.cookProfile?.pickupAddress,
          cookPhone: fullOrder.cook.phone,
        }),
      });
    }

    // Handle cancellation: refund + email
    if (status === 'CANCELLED') {
      // Issue Stripe refund if payment was captured
      if (order.stripePaymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: order.stripePaymentIntentId,
          });
          console.log(`[orders] Refund issued for order ${id}, PI ${order.stripePaymentIntentId}`);
        } catch (refundErr) {
          console.error('[orders] Stripe refund failed:', refundErr);
          // Don't block the cancellation — log and continue
        }
      }

      // Email buyer about cancellation
      if (fullOrder?.buyer.email) {
        await sendEmail({
          to: fullOrder.buyer.email,
          subject: orderCancelledSubject(),
          html: orderCancelledHtml({
            buyerName: fullOrder.buyer.name ?? 'there',
            dishTitle: fullOrder.dish.title,
            cookName: fullOrder.cook.name ?? 'the cook',
            totalPrice: fullOrder.totalPrice,
          }),
        });
      }
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error('[order PUT]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
