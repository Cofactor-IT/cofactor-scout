#!/bin/sh
set -e

# Run Prisma migrations/create tables
echo "Running Prisma db push..."
node ./node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss

# Populate null Person slugs (for existing data after schema change)
echo "Populating null Person slugs..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const persons = await prisma.person.findMany({ where: { slug: null } });
  for (const person of persons) {
    const baseSlug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.person.findFirst({ where: { slug, id: { not: person.id } } })) {
      slug = baseSlug + '-' + counter++;
    }
    await prisma.person.update({ where: { id: person.id }, data: { slug } });
    console.log('Updated slug for:', person.name, '->', slug);
  }
  await prisma.\$disconnect();
  console.log('Slug population complete.');
})();
"

# Start the Next.js server
echo "Starting Next.js server..."
exec node server.js
