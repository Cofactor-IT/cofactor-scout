#!/bin/sh
set -e

# Run Prisma migrations/create tables
echo "Running Prisma db push..."
npx prisma db push --skip-generate

# Start the Next.js server
echo "Starting Next.js server..."
exec node server.js
