import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ApplicationStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json() as { status: 'APPROVED' | 'REJECTED'; adminNotes?: string };

  if (!body.status || !['APPROVED', 'REJECTED'].includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const application = await db.kitchenApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update application status
    const updated = await db.kitchenApplication.update({
      where: { id },
      data: {
        status: body.status as ApplicationStatus,
        adminNotes: body.adminNotes ?? null,
      },
    });

    if (body.status === 'APPROVED') {
      // Set user role to COOK
      await db.user.update({
        where: { id: application.userId },
        data: { role: 'COOK' },
      });

      // Create CookProfile if it doesn't exist
      await db.cookProfile.upsert({
        where: { userId: application.userId },
        create: {
          userId: application.userId,
          kitchenName: application.kitchenName,
          description: application.description ?? undefined,
          cuisineTags: application.cuisineTags,
          permitNumber: application.permitNumber ?? undefined,
          isVerified: true,
        },
        update: {
          isVerified: true,
        },
      });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
