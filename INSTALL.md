# Installation Guide

## Step 1 — Install new dependencies

```bash
cd /path/to/homecooked

npm install \
  @stripe/react-stripe-js \
  @stripe/stripe-js \
  @aws-sdk/client-s3 \
  @aws-sdk/s3-request-presigner \
  @prisma/client \
  next-auth@beta \
  @auth/prisma-adapter \
  bcryptjs \
  stripe

npm install -D \
  prisma \
  @types/bcryptjs
```

## Step 2 — Copy files from this directory

Copy all files from this `homecooked-changes/` directory into your repo root, preserving the directory structure. Files to copy:

```
prisma/schema.prisma                           → new
src/lib/db.ts                                  → new
src/lib/auth.ts                                → new
src/app/api/auth/[...nextauth]/route.ts        → new
src/app/api/auth/register/route.ts             → new
src/app/api/dishes/route.ts                    → new
src/app/api/dishes/[id]/route.ts               → new
src/app/api/orders/route.ts                    → new
src/app/api/orders/[id]/route.ts               → new
src/app/api/messages/route.ts                  → new
src/app/api/reviews/route.ts                   → new
src/app/api/users/[id]/route.ts                → new
src/app/api/stripe/webhook/route.ts            → new
src/app/api/stripe/create-payment-intent/route.ts → new
src/context/auth-context.tsx                   → replaces existing
src/app/(auth)/login/page.tsx                  → replaces existing
src/app/(auth)/register/page.tsx               → new
src/app/sell/page.tsx                          → replaces existing
src/app/layout.tsx                             → replaces existing
middleware.ts                                  → new (root of project)
next.config.ts                                 → replaces existing
Dockerfile                                     → new
docker-compose.yml                             → new
nginx.conf                                     → new
.env.example                                   → new

# Round 4 additions
src/lib/storage.ts                             → new (R2/S3 abstraction)
src/app/api/upload/route.ts                    → new (server-side upload fallback)
src/app/api/upload/presign/route.ts            → new (presigned URL endpoint)
src/components/image-upload.tsx                → new (drag-and-drop upload component)

# Round 3 additions
src/app/messages/page.tsx                      → replaces existing (real API)
src/app/profile/page.tsx                       → replaces existing (redirect)
src/app/profile/[id]/page.tsx                  → new (public profile)
src/app/profile/edit/page.tsx                  → new (edit profile + dish mgmt)
src/app/checkout/[orderId]/page.tsx            → new (Stripe checkout)
src/components/stripe-checkout.tsx             → new (Stripe Elements wrapper)
src/hooks/use-debounce.ts                      → new (search debounce utility)
```

## Step 3 — Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

Minimum required to run locally:
```
DATABASE_URL=postgresql://localhost:5432/homecooked
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

## Step 4 — Set up the database

You need PostgreSQL running locally. Easiest way:

```bash
# With Homebrew (Mac)
brew install postgresql@16
brew services start postgresql@16

# Or with Docker (no install needed)
docker run -d \
  --name homecooked-db \
  -e POSTGRES_DB=homecooked \
  -e POSTGRES_PASSWORD=localpassword \
  -p 5432:5432 \
  postgres:16-alpine
```

Then run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Step 5 — Run the dev server

```bash
npm run dev
```

Visit http://localhost:9002

## Step 6 — Self-host with Docker Compose

```bash
# Copy and fill out env vars
cp .env.example .env

# Build and start everything
docker compose up -d

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Check logs
docker compose logs -f app
```

## Step 7 — SSL with Let's Encrypt

```bash
# Get certificates (replace with your domain)
docker compose run certbot certonly \
  --webroot -w /var/www/certbot \
  -d yourdomain.com

# Update nginx.conf with your domain name
# Restart nginx
docker compose restart nginx
```

## Notes

- The `apphosting.yaml` can be deleted — it was for Firebase App Hosting
- The existing mock data in `src/lib/data.ts` is kept untouched for now — the Discover page will need to be updated to call `/api/dishes` instead of importing from `data.ts`. That's the next step.
- Firebase Auth is replaced by NextAuth.js — the `firebase` package can be removed from dependencies once you confirm everything works
