import { prisma } from '../src/lib/prisma.js';

async function main() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const { hostname, pathname } = new URL(rawUrl);

  console.log(`Database target -> host: ${hostname} | database: ${pathname.slice(1)}`);

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    throw new Error('Refusing to inspect a local database. Set DATABASE_URL to the Render URL.');
  }

  const total = await prisma.account.count();

  const accounts = await prisma.account.findMany({
    where: { deletedAt: null },
    select: {
      email: true,
      role: true,
      isActive: true,
      emailVerifiedAt: true,
      deletedAt: true,
    },
    orderBy: { email: 'asc' },
  });

  console.log(`Total accounts in database: ${total}`);
  console.log(`Non-deleted accounts: ${accounts.length}`);
  console.table(
    accounts.map((account) => ({
      email: account.email,
      role: account.role,
      active: account.isActive,
      emailVerified: account.emailVerifiedAt !== null,
    })),
  );
}

main()
  .catch((error) => {
    console.error('Account diagnostic failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
