#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push --accept-data-loss --skip-generate

echo "Checking sample data..."
npx tsx prisma/seed-if-empty.ts

echo "Starting server..."
exec node server.js
