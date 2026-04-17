# Image Storage Setup

Homecooked uses either **Cloudflare R2** (recommended) or **AWS S3** for dish photos and avatars.

---

## Option A — Cloudflare R2 (Recommended)

**Why R2?** No egress fees (free bandwidth), S3-compatible API, generous free tier (10 GB storage, 1M writes/month).

### 1. Create a Cloudflare account
https://dash.cloudflare.com/sign-up

### 2. Create an R2 bucket
- Go to **R2 Object Storage** → **Create Bucket**
- Name it `homecooked-images` (or anything you like)
- Leave location as Auto

### 3. Enable public access
- Open your bucket → **Settings** → **Public Access**
- Enable "Allow public access"
- Copy the **Public Bucket URL** — looks like `https://pub-xxxxxxxx.r2.dev`

### 4. Create an API token
- Go to **R2** → **Manage R2 API Tokens** → **Create API token**
- Permissions: **Object Read & Write**
- Copy `Access Key ID` and `Secret Access Key`

### 5. Get your Account ID
- Top-right of Cloudflare dashboard → copy your Account ID

### 6. Configure CORS on the bucket
In the bucket → Settings → CORS Policy, add:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

### 7. Set env vars
```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=homecooked-images
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

### 8. Update next.config.ts
Add your R2 public URL hostname to `remotePatterns`:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'pub-xxxxxxxx.r2.dev' },
  ],
},
```

---

## Option B — AWS S3

### 1. Create an S3 bucket
- AWS Console → S3 → Create Bucket
- Uncheck "Block all public access"

### 2. Add bucket policy for public reads
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 3. Configure CORS
```json
[
  {
    "AllowedHeaders": ["Content-Type"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Create IAM user with S3 permissions
- IAM → Users → Create User
- Attach policy: `AmazonS3FullAccess` (or scoped to your bucket only)
- Create access key → copy ID and secret

### 5. Set env vars
```env
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-west-2
S3_BUCKET_NAME=your-bucket-name
S3_PUBLIC_URL=https://your-bucket-name.s3.us-west-2.amazonaws.com
```

---

## Testing Locally Without Storage

If you don't have R2/S3 set up yet, the upload component will fail gracefully with an error toast. The rest of the app works fine — dishes just won't have photos (they'll use the placeholder).

To test uploads locally, the easiest option is to spin up a local MinIO instance:

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

Then set:
```env
R2_ACCOUNT_ID=local
R2_ACCESS_KEY_ID=minioadmin
R2_SECRET_ACCESS_KEY=minioadmin
R2_BUCKET_NAME=homecooked-images
R2_PUBLIC_URL=http://localhost:9000/homecooked-images
```

Update the endpoint in `src/lib/storage.ts` to point to `http://localhost:9000` for local MinIO.
