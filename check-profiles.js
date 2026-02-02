import { PrismaClient } from '@prisma/client';

async function checkProfiles() {
  const prisma = new PrismaClient();
  try {
    const studentProfiles = await prisma.studentProfile.findMany();
    const instructorProfiles = await prisma.instructorProfile.findMany();
    console.log('Student profiles:', studentProfiles.length);
    console.log('Instructor profiles:', instructorProfiles.length);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfiles();