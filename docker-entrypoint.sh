#!/bin/sh
set -e

# Run Prisma migrations/create tables
echo "Running Prisma db push..."
node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

# Start the Next.js server
echo "Starting Next.js server..."
exec node server.js
