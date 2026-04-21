import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const respondSchema = z.object({
  action: z.enum(['confirm', 'decline']),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { action } = parsed.data;
    const { messageId } = params;

    // Fetch the message with its order
    const message = await db.message.findUnique({
      where: { id: messageId },
      include: { order: true },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.messageType !== 'PICKUP_PROPOSAL') {
      return NextResponse.json({ error: 'Message is not a pickup proposal' }, { status: 400 });
    }

    if (message.proposalStatus !== 'PENDING') {
      return NextResponse.json({ error: 'Proposal is no longer pending' }, { status: 409 });
    }

    const order = message.order;
    if (!order) {
      return NextResponse.json({ error: 'Order not found for this proposal' }, { status: 404 });
    }

    // Verify the user is part of this order
    if (order.buyerId !== session.user.id && order.cookId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'confirm') {
      // Only the buyer can confirm
      if (order.buyerId !== session.user.id) {
        return NextResponse.json({ error: 'Only the buyer can confirm a pickup proposal' }, { status: 403 });
      }

      // Use a transaction: confirm this proposal, decline all others, update order
      const updatedMessage = await db.$transaction(async (tx) => {
        // Confirm this message
        const updated = await tx.message.update({
          where: { id: messageId },
          data: { proposalStatus: 'CONFIRMED' },
        });

        // Decline all other pending proposals for the same order
        await tx.message.updateMany({
          where: {
            orderId: order.id,
            messageType: 'PICKUP_PROPOSAL',
            proposalStatus: 'PENDING',
            id: { not: messageId },
          },
          data: { proposalStatus: 'DECLINED' },
        });

        // Update the order with confirmed pickup details
        await tx.order.update({
          where: { id: order.id },
          data: {
            pickupTime: message.proposedTime,
            confirmedPickupAddress: message.proposedAddress,
          },
        });

        return updated;
      });

      return NextResponse.json({ message: updatedMessage });
    } else {
      // Decline — either party can decline
      const updatedMessage = await db.message.update({
        where: { id: messageId },
        data: { proposalStatus: 'DECLINED' },
      });

      return NextResponse.json({ message: updatedMessage });
    }
  } catch (err) {
    console.error('[messages/respond POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
