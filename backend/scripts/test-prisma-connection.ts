import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('Testing Prisma database connection...');

  const count = await prisma.account.count();

  console.log('Prisma connection successful.');
  console.log('Account count:', count);
}

main()
  .catch((error) => {
    console.error('Prisma connection test failed:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
