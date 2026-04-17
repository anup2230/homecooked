/**
 * Image storage abstraction — supports Cloudflare R2 (preferred) and AWS S3.
 * Both use the S3-compatible API via @aws-sdk/client-s3.
 *
 * Set one of these env var groups:
 *
 * Option A — Cloudflare R2 (recommended: cheap, no egress fees):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_NAME, R2_PUBLIC_URL
 *
 * Option B — AWS S3:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION,
 *   S3_BUCKET_NAME, S3_PUBLIC_URL (or use CloudFront)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// Singleton client — reuse across requests instead of creating a new one each time
let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  if (process.env.R2_ACCOUNT_ID) {
    // Cloudflare R2
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  } else {
    // AWS S3
    _client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-west-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  return _client;
}

function getBucket(): string {
  return (process.env.R2_BUCKET_NAME ?? process.env.S3_BUCKET_NAME)!;
}

function getPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL ?? process.env.S3_PUBLIC_URL ?? '';
  return `${base.replace(/\/$/, '')}/${key}`;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export type UploadFolder = 'dishes' | 'avatars';

/**
 * Upload a file buffer directly to storage.
 * Used for server-side uploads.
 */
export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  folder: UploadFolder
): Promise<{ url: string; key: string }> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`File type not allowed: ${mimeType}`);
  }
  if (buffer.byteLength > MAX_SIZE_BYTES) {
    throw new Error('File too large. Maximum size is 5 MB.');
  }

  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const key = `${folder}/${randomUUID()}.${ext}`;
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Files are public-read so they can be served directly
      ACL: 'public-read',
    })
  );

  return { url: getPublicUrl(key), key };
}

/**
 * Generate a presigned URL for direct browser → storage uploads.
 * The browser uploads directly, bypassing the Next.js server entirely.
 * Much more efficient for large files.
 */
export async function getPresignedUploadUrl(
  mimeType: string,
  folder: UploadFolder
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`File type not allowed: ${mimeType}`);
  }

  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const key = `${folder}/${randomUUID()}.${ext}`;
  const client = getClient();

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: mimeType,
      ACL: 'public-read',
    }),
    { expiresIn: 300 } // 5 minutes
  );

  return { uploadUrl, publicUrl: getPublicUrl(key), key };
}

/**
 * Delete a file by key.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
}
