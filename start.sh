#!/bin/sh
# Deliberately no "set -e" here — every step below is written to survive
# a failure on its own, rather than letting one hiccup crash the whole
# container. That matters a lot on free-tier databases like Neon, which
# suspend when idle: the very first connection attempt after a period of
# sleep can legitimately fail or time out while the database wakes back
# up, and we don't want that to take the whole app down with it.

echo "Syncing database schema..."
attempt=1
max_attempts=5
until npx prisma db push --accept-data-loss --skip-generate; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Schema sync did not succeed after $max_attempts attempts — starting the server anyway."
    break
  fi
  echo "Schema sync attempt $attempt failed (database may still be waking up) — retrying in 5s..."
  attempt=$((attempt + 1))
  sleep 5
done

echo "Checking sample data..."
npx tsx prisma/seed-if-empty.ts || echo "Sample data check failed — continuing anyway."

# NEXTAUTH_URL is required — if it's unset or empty, NextAuth crashes every
# page on startup with "Invalid URL". Rather than rely on remembering to set
# it by hand every time (including after recreating the service), fall back
# to Render's own automatically-provided RENDER_EXTERNAL_URL, and only fall
# back further to localhost if neither is available (e.g. local Docker,
# where docker-compose already sets NEXTAUTH_URL explicitly anyway).
if [ -z "$NEXTAUTH_URL" ]; then
  export NEXTAUTH_URL="${RENDER_EXTERNAL_URL:-http://localhost:3000}"
  echo "NEXTAUTH_URL was not set — defaulting to $NEXTAUTH_URL"
fi

echo "Starting server..."
exec node server.js
