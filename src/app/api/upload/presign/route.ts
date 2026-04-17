/**
 * POST /api/upload/presign
 *
 * Returns a presigned S3/R2 URL so the browser can upload directly to storage
 * without streaming through the Next.js server.
 *
 * Body: { mimeType: string, folder: "dishes" | "avatars" }
 * Returns: { uploadUrl, publicUrl, key }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/storage';
import { z } from 'zod';

const schema = z.object({
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  folder: z.enum(['dishes', 'avatars']),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only cooks can upload dish photos
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { mimeType, folder } = parsed.data;

  if (folder === 'dishes' && (session.user as any).role !== 'COOK') {
    return NextResponse.json(
      { error: 'Only cooks can upload dish photos' },
      { status: 403 }
    );
  }

  try {
    const result = await getPresignedUploadUrl(mimeType, folder);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[upload presign]', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
