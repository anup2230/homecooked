import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const sendMessageSchema = z.object({
  recipientId: z.string(),
  body: z.string().min(1).max(2000),
  orderId: z.string().optional(),
});

// GET /api/messages — get all conversations for current user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all messages involving the current user, grouped by conversation partner
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        order: { select: { id: true, dish: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[messages GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { recipientId, body: messageBody, orderId } = parsed.data;

    // If tied to an order, verify the sender is part of that order
    if (orderId) {
      const order = await db.order.findUnique({ where: { id: orderId } });
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      if (order.buyerId !== session.user.id && order.cookId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        body: messageBody,
        orderId: orderId ?? null,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error('[messages POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
