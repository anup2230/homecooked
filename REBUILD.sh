#!/bin/bash
# Homecooked Rebuild Script
# Run this to complete the stack migration to Prisma 5 + NextAuth v4
set -e

cd /Users/anuppatel/homecooked

echo "=== 1. Removing old node_modules and lock file ==="
rm -rf node_modules package-lock.json

echo "=== 2. Installing packages ==="
npm install

echo "=== 3. Generating Prisma client ==="
npx prisma generate

echo "=== 4. Resetting database and running migrations ==="
npx prisma migrate reset --force

echo "=== 5. Starting dev server ==="
npm run dev
