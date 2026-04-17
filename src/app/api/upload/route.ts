/**
 * POST /api/upload
 *
 * Fallback: server-side upload for environments where presigned URLs
 * aren't available (e.g. local dev without storage configured).
 * Accepts multipart/form-data with a "file" field.
 *
 * In production, prefer /api/upload/presign for direct browser → storage uploads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile, UploadFolder } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as UploadFolder) ?? 'dishes';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (folder === 'dishes' && (session.user as any).role !== 'COOK') {
      return NextResponse.json({ error: 'Only cooks can upload dish photos' }, { status: 403 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, key } = await uploadFile(buffer, file.type, folder);

    return NextResponse.json({ url, key });
  } catch (err: any) {
    console.error('[upload]', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
