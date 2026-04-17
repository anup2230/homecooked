# Homecooked — Engineering Changes

## How to Apply

1. Copy the contents of this directory into your `homecooked` repo root
2. Run `npm install` to pick up new dependencies
3. Set up your `.env.local` (see `.env.example`)
4. Run `npx prisma migrate dev --name init` to create the database
5. Run `npm run dev`

## What Changed

### New Dependencies (add to package.json)
```
@prisma/client
prisma
next-auth@beta
@auth/prisma-adapter
bcryptjs
@types/bcryptjs
stripe
@stripe/stripe-js
```

Install with:
```bash
npm install @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs stripe @stripe/stripe-js
npm install -D prisma @types/bcryptjs
```

### Files Added / Modified

| File | Status | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | NEW | Full database schema |
| `src/lib/db.ts` | NEW | Prisma client singleton |
| `src/lib/auth.ts` | NEW | NextAuth.js v5 config |
| `src/app/api/auth/[...nextauth]/route.ts` | NEW | NextAuth route handler |
| `src/app/api/dishes/route.ts` | NEW | GET (browse) + POST (create dish) |
| `src/app/api/dishes/[id]/route.ts` | NEW | GET + PUT + DELETE single dish |
| `src/app/api/orders/route.ts` | NEW | GET + POST orders |
| `src/app/api/orders/[id]/route.ts` | NEW | GET + PUT (status update) |
| `src/app/api/users/[id]/route.ts` | NEW | GET user profile |
| `src/app/api/stripe/webhook/route.ts` | NEW | Stripe webhook handler |
| `src/context/auth-context.tsx` | MODIFIED | Wired to NextAuth session |
| `src/app/(auth)/login/page.tsx` | MODIFIED | Real login form |
| `src/app/(auth)/register/page.tsx` | NEW | Real registration |
| `src/app/sell/page.tsx` | MODIFIED | Real cook signup form |
| `.env.example` | NEW | Required environment variables |
| `docker-compose.yml` | NEW | Self-hosting setup |
| `Dockerfile` | NEW | Production Docker image |
| `nginx.conf` | NEW | Nginx reverse proxy config |
