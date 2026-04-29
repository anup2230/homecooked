import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as { role?: Role; isVerified?: boolean };

  if (body.role !== undefined && !Object.values(Role).includes(body.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  try {
    // Update role if provided
    if (body.role !== undefined) {
      await db.user.update({
        where: { id },
        data: { role: body.role },
      });
    }

    // Update cook verification if provided
    if (body.isVerified !== undefined) {
      await db.cookProfile.update({
        where: { userId: id },
        data: { isVerified: body.isVerified },
      });
    }

    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, cookProfile: { select: { isVerified: true } } },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
}
