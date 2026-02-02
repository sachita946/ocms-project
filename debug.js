import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debug() {
  try {
    console.log('=== DATABASE DEBUG ===');

    const users = await prisma.user.findMany();
    console.log('\nUSERS:');
    users.forEach(u => console.log('  ID:', u.id, 'Email:', u.email, 'Role:', u.role));

    const profiles = await prisma.studentProfile.findMany();
    console.log('\nSTUDENT PROFILES:');
    profiles.forEach(p => console.log('  ID:', p.id, 'User ID:', p.user_id));

    const enrollments = await prisma.enrollment.findMany({ include: { course: true } });
    console.log('\nENROLLMENTS:');
    enrollments.forEach(e => console.log('  ID:', e.id, 'Student ID:', e.student_id, 'Course ID:', e.course_id, 'Course:', e.course?.title));

    const payments = await prisma.payment.findMany();
    console.log('\nPAYMENTS:');
    payments.forEach(p => console.log('  ID:', p.id, 'Student ID:', p.student_id, 'Course ID:', p.course_id, 'Status:', p.status));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

debug();