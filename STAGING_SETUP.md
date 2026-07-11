# Homecooked — Staging Environment Setup

**Stack:** Vercel (free) + Neon PostgreSQL (free) + Cloudflare R2 (existing)
**Cost:** $0/mo for staging

---

## Step 1: Neon (Database)

1. Go to https://neon.tech → Sign up / Log in
2. Create a new project → name it `homecooked-staging`
3. Select **PostgreSQL 16**, region **US West** (closest to LA)
4. Once created, go to **Connection Details**
5. Copy the connection string — looks like:
   ```
   postgresql://user:password@ep-xxx.us-west-2.aws.neon.tech/neondb?sslmode=require
   ```
6. Save it — you'll paste this into Vercel as `DATABASE_URL`

> **Tip:** Neon supports DB branching. Later you can branch prod → staging so they share the same schema but have isolated data.

---

## Step 2: Vercel (App Hosting)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **Add New Project** → Import `anup2230/homecooked`
3. Framework: **Next.js** (auto-detected)
4. Root directory: leave as `/`
5. **Do NOT deploy yet** — set env vars first (Step 3)

---

## Step 3: Environment Variables in Vercel

In Vercel → Project Settings → Environment Variables, add all of these.
Set scope to **Preview** for staging, **Production** for prod.

### Required

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string from Step 1 |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` → paste output |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://homecooked.vercel.app`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe **test** publishable key |
| `STRIPE_SECRET_KEY` | Stripe **test** secret key |
| `STRIPE_WEBHOOK_SECRET` | From Step 4 below |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `RESEND_API_KEY` | From https://resend.com (free tier) |
| `FROM_EMAIL` | `noreply@homecooked.app` (or your domain) |

### Image Storage (Cloudflare R2 — existing account)

| Variable | Value |
|---|---|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret |
| `R2_BUCKET_NAME` | e.g. `homecooked-staging` |
| `R2_PUBLIC_URL` | Public R2 bucket URL |

### Optional

| Variable | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | For Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | For Google OAuth login |

---

## Step 4: Stripe Webhook

1. Go to https://dashboard.stripe.com → Developers → Webhooks
2. Click **Add endpoint**
3. URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated` (for Stripe Connect)
5. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Vercel

> Use **test mode** keys for staging. Stripe has a "Test" toggle in the top-left of the dashboard.

---

## Step 5: Run DB Migrations

After first deploy, run migrations against Neon:

```bash
cd ~/homecooked
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
```

Or set it in your local `.env.staging` and run:
```bash
dotenv -e .env.staging -- npx prisma migrate deploy
```

---

## Step 6: Stripe Connect (for Cook Payouts)

1. Go to https://dashboard.stripe.com → Settings → Connect
2. Enable **Connect** for your account
3. Under Connect settings → set your platform name to "Homecooked"
4. Add redirect URIs:
   - `https://your-app.vercel.app/api/stripe/connect/return`
5. Make sure you're using **test mode** keys during staging

---

## Step 7: Resend (Transactional Email)

1. Go to https://resend.com → Sign up
2. Free tier: 3,000 emails/mo, 100/day — plenty for staging
3. Create an API key → paste as `RESEND_API_KEY` in Vercel
4. (Optional) Add and verify your domain for custom `FROM_EMAIL`
   - Without domain verification, emails send from `onboarding@resend.dev`
   - Fine for staging, required for production

---

## Step 8: Deploy

1. Back in Vercel → click **Deploy**
2. Watch the build logs — should pass (build was verified locally)
3. Once live, test the full flow:
   - Sign up as buyer + cook
   - Cook completes onboarding → connects Stripe
   - Buyer places order → pays with Stripe test card `4242 4242 4242 4242`
   - Cook confirms → buyer gets email
   - Cook marks ready → buyer gets pickup email

---

## Checklist

- [ ] Neon project created, connection string saved
- [ ] Vercel project created, linked to GitHub repo
- [ ] All env vars set in Vercel (Preview scope)
- [ ] Stripe webhook endpoint added (test mode)
- [ ] Stripe Connect enabled in dashboard
- [ ] Resend API key created
- [ ] DB migrations run against Neon
- [ ] First deploy successful
- [ ] End-to-end order flow tested

---

## Going to Production (later)

When ready to go live:
- Swap Stripe test keys → live keys in Vercel (Production scope)
- Add a new Stripe webhook endpoint for the production URL
- Upgrade Neon if > 0.5GB storage (Neon Launch: $19/mo)
- Upgrade Vercel if you need cron jobs or > 10s function timeout (Pro: $20/mo)
- Consider Railway (~$15-25/mo) as a simpler all-in-one alternative to Vercel + Neon

---

*Created 2026-06-08 | Sterling*
