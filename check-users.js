import { PrismaClient } from '@prisma/client';

async function checkUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    users.forEach(user => {
      console.log(`User: ${user.email}, Role: ${user.role}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();