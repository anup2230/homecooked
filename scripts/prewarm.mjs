#!/usr/bin/env node
/**
 * prewarm.mjs — hits key routes after dev server starts to pre-compile them.
 * Run via: npm run prewarm (or automatically via npm run dev:warm)
 */

const BASE = process.env.DEV_URL || 'http://localhost:9002';
const CONCURRENCY = 3; // hit N routes at a time
const TIMEOUT_MS = 30_000;

// Routes worth pre-warming (most visited first)
const ROUTES = [
  '/',
  '/discover',
  '/sell',
  '/map',
  '/messages',
  '/orders',
  '/profile/me',
  '/profile/cook',
  '/onboarding',
  '/about',
  '/api/auth/session',
  '/api/dishes?limit=8',
];

async function waitForServer(maxWaitMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(`${BASE}/api/auth/session`, { signal: AbortSignal.timeout(2000) });
      if (res.status < 600) return true;
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function hit(route) {
  const url = `${BASE}${route}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    const ms = Date.now() - start;
    console.log(`  ${res.ok || res.status < 400 ? '✓' : '⚠'} ${route.padEnd(35)} ${res.status}  ${ms}ms`);
  } catch (e) {
    const ms = Date.now() - start;
    console.log(`  ✗ ${route.padEnd(35)} ERR  ${ms}ms  (${e.message})`);
  }
}

async function main() {
  console.log(`\n🔥 Prewarming ${BASE}...\n`);
  console.log('  Waiting for server to be ready...');
  const ready = await waitForServer();
  if (!ready) {
    console.error('  Server did not respond in time. Aborting.');
    process.exit(1);
  }
  console.log('  Server ready. Hitting routes...\n');

  // Process in chunks of CONCURRENCY
  for (let i = 0; i < ROUTES.length; i += CONCURRENCY) {
    const chunk = ROUTES.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(hit));
  }

  console.log('\n✅ Prewarm complete.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
