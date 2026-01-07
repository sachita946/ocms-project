import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@ocms.com' },
      update: {},
      create: {
        email: 'admin@ocms.com',
        first_name: 'Admin',
        last_name: 'User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Admin user created:', admin);

    // Create a test instructor
    const instructorPassword = await bcrypt.hash('instructor123', 10);

    const instructor = await prisma.user.upsert({
      where: { email: 'instructor@ocms.com' },
      update: {},
      create: {
        email: 'instructor@ocms.com',
        first_name: 'John',
        last_name: 'Doe',
        password: instructorPassword,
        role: 'INSTRUCTOR',
      },
    });

    // Create instructor profile
    await prisma.instructorProfile.upsert({
      where: { user_id: instructor.id },
      update: {},
      create: {
        user_id: instructor.id,
        full_name: 'John Doe',
        qualifications: 'PhD in Computer Science',
        experience_years: 5,
        expertise_area: 'Web Development',
        bio: 'Experienced instructor in web development',
      },
    });

    console.log('Instructor user created:', instructor);

    // Create a test student
    const studentPassword = await bcrypt.hash('student123', 10);

    const student = await prisma.user.upsert({
      where: { email: 'student@ocms.com' },
      update: {},
      create: {
        email: 'student@ocms.com',
        first_name: 'Jane',
        last_name: 'Smith',
        password: studentPassword,
        role: 'STUDENT',
      },
    });

    // Create student profile
    await prisma.studentProfile.upsert({
      where: { user_id: student.id },
      update: {},
      create: {
        user_id: student.id,
        full_name: 'Jane Smith',
        current_education_level: 'Undergraduate',
        interests: ['Programming', 'Web Development'],
      },
    });

    console.log('Student user created:', student);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();