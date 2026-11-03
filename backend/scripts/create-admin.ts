import { prisma } from '../src/lib/prisma.js';
import { hashPassword } from '../src/services/password.service.js';

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error('DATABASE_URL is not set.');
  }

  const { hostname, pathname } = new URL(rawUrl);
  console.log(`Target -> host: ${hostname} | database: ${pathname.slice(1)}`);

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    throw new Error(
      'Refusing to run against a local database. Set DATABASE_URL to the Render URL.',
    );
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME ?? 'User';

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  }

  const before = await prisma.account.count();
  console.log(`Accounts in database before: ${before}`);

  const existing = await prisma.account.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existing) {
    console.log(
      `An account with this email already exists (role: ${existing.role}). Nothing changed.`,
    );
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.account.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      emailVerifiedAt: new Date(),
    },
  });

  const after = await prisma.account.count();
  console.log(`Created SUPER_ADMIN: ${email}`);
  console.log(`Accounts in database after: ${after}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
