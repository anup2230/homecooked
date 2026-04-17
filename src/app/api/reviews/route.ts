import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const createReviewSchema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// POST /api/reviews — buyer leaves a review after completing an order
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { orderId, rating, comment } = parsed.data;

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the buyer can review this order' }, { status: 403 });
    }
    if (order.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only review completed orders' }, { status: 409 });
    }

    // Check for duplicate review
    const existing = await db.review.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json({ error: 'Already reviewed this order' }, { status: 409 });
    }

    const review = await db.review.create({
      data: {
        orderId,
        reviewerId: session.user.id,
        cookId: order.cookId,
        dishId: order.dishId,
        rating,
        comment,
      },
    });

    // Update cook's average rating
    const cookReviews = await db.review.aggregate({
      where: { cookId: order.cookId },
      _avg: { rating: true },
    });

    await db.cookProfile.update({
      where: { userId: order.cookId },
      data: { avgRating: cookReviews._avg.rating ?? rating },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error('[reviews POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
