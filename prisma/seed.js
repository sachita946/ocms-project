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
        is_verified: true,
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

    // Create advanced courses
    const advancedCourses = [
      {
        id: 1001, // Use high IDs to avoid conflicts
        title: 'UI/UX Design Masterclass',
        description: 'Learn modern UI/UX design principles with Figma, Adobe XD, and prototyping tools. Includes live Zoom sessions with industry experts.',
        category: 'Design',
        level: 'ADVANCED',
        price: 20000,
        duration_weeks: 8,
        language: 'English',
        instructor_id: instructor.id,
        zoom_link: 'https://zoom.us/j/123456789',
        is_published: true,
        requirements: ['Basic design knowledge', 'Computer with design software'],
        learning_outcomes: [
          'Master Figma and Adobe XD',
          'Create professional UI/UX designs',
          'Understand user research and testing',
          'Build interactive prototypes'
        ]
      },
      {
        id: 1002,
        title: 'Full-Stack Web Development',
        description: 'Complete full-stack development course covering React, Node.js, Express, and MongoDB. Build real-world applications.',
        category: 'Web Development',
        level: 'ADVANCED',
        price: 25000,
        duration_weeks: 12,
        language: 'English',
        instructor_id: instructor.id,
        zoom_link: 'https://zoom.us/j/987654321',
        is_published: true,
        requirements: ['HTML, CSS, JavaScript basics', 'Basic programming knowledge'],
        learning_outcomes: [
          'Build full-stack web applications',
          'Master React and Node.js',
          'Work with databases',
          'Deploy applications to production'
        ]
      },
      {
        id: 1003,
        title: 'Backend Development with Node.js',
        description: 'Advanced backend development with Node.js, Express, PostgreSQL, and API design. Learn to build scalable server applications.',
        category: 'Backend Development',
        level: 'ADVANCED',
        price: 22000,
        duration_weeks: 10,
        language: 'English',
        instructor_id: instructor.id,
        zoom_link: 'https://zoom.us/j/456789123',
        is_published: true,
        requirements: ['JavaScript programming', 'Basic web development'],
        learning_outcomes: [
          'Build RESTful APIs',
          'Work with PostgreSQL databases',
          'Implement authentication and security',
          'Deploy backend applications'
        ]
      },
      {
        id: 1004,
        title: 'Python for Data Science & AI',
        description: 'Comprehensive Python programming course focused on data science, machine learning, and AI applications.',
        category: 'Python Development',
        level: 'ADVANCED',
        price: 23000,
        duration_weeks: 10,
        language: 'English',
        instructor_id: instructor.id,
        zoom_link: 'https://zoom.us/j/789123456',
        is_published: true,
        requirements: ['Basic programming knowledge', 'Mathematics basics'],
        learning_outcomes: [
          'Master Python programming',
          'Work with data analysis libraries',
          'Build machine learning models',
          'Create AI applications'
        ]
      },
      {
        id: 1005,
        title: 'Artificial Intelligence & Machine Learning',
        description: 'Deep dive into AI and ML concepts with practical projects using Python, TensorFlow, and scikit-learn.',
        category: 'AI/ML',
        level: 'ADVANCED',
        price: 28000,
        duration_weeks: 14,
        language: 'English',
        instructor_id: instructor.id,
        zoom_link: 'https://zoom.us/j/321654987',
        is_published: true,
        requirements: ['Python programming', 'Statistics and mathematics', 'Basic ML concepts'],
        learning_outcomes: [
          'Understand AI and ML fundamentals',
          'Build neural networks',
          'Work with TensorFlow and PyTorch',
          'Deploy ML models in production'
        ]
      }
    ];

    // Store zoom links for creating resources later
    const courseZoomLinks = {
      1001: 'https://zoom.us/j/123456789',
      1002: 'https://zoom.us/j/987654321',
      1003: 'https://zoom.us/j/456789123',
      1004: 'https://zoom.us/j/789123456',
      1005: 'https://zoom.us/j/321654987'
    };

    for (const courseData of advancedCourses) {
      const course = await prisma.course.upsert({
        where: { id: courseData.id },
        update: {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          price: courseData.price,
          duration_weeks: courseData.duration_weeks,
          language: courseData.language,
          instructor_id: courseData.instructor_id,
          zoom_link: courseData.zoom_link,
          is_published: courseData.is_published,
          requirements: courseData.requirements,
          learning_outcomes: courseData.learning_outcomes
        },
        create: courseData
      });

      // Create zoom resource for this course
      if (courseZoomLinks[courseData.id]) {
        await prisma.courseResource.upsert({
          where: { id: courseData.id * 1000 }, // Use course id * 1000 as resource id
          update: {},
          create: {
            id: courseData.id * 1000,
            course_id: course.id,
            type: 'zoom',
            title: 'Live Zoom Session',
            content: 'Join our live Zoom sessions for interactive learning and Q&A with instructors.',
            zoom_link: courseZoomLinks[courseData.id],
            user_id: instructor.id
          }
        });
      }
    }

    // Create free beginner courses
    const freeCourses = [
      {
        id: 2001,
        title: 'Introduction to Programming',
        description: 'Learn the fundamentals of programming with hands-on exercises. Perfect for complete beginners.',
        category: 'Programming',
        level: 'BEGINNER',
        price: 0,
        duration_weeks: 4,
        language: 'English',
        instructor_id: instructor.id,
        is_published: true,
        requirements: ['Basic computer skills'],
        learning_outcomes: [
          'Understand programming concepts',
          'Write basic programs',
          'Debug simple code',
          'Understand programming logic'
        ]
      },
      {
        id: 2002,
        title: 'HTML & CSS Fundamentals',
        description: 'Master the building blocks of web development. Create beautiful websites from scratch.',
        category: 'Web Development',
        level: 'BEGINNER',
        price: 0,
        duration_weeks: 6,
        language: 'English',
        instructor_id: instructor.id,
        is_published: true,
        requirements: ['Basic computer literacy'],
        learning_outcomes: [
          'Create HTML documents',
          'Style with CSS',
          'Build responsive layouts',
          'Understand web standards'
        ]
      },
      {
        id: 2003,
        title: 'JavaScript Basics',
        description: 'Learn JavaScript programming for web development. Interactive course with practical examples.',
        category: 'Programming',
        level: 'INTERMEDIATE',
        price: 0,
        duration_weeks: 8,
        language: 'English',
        instructor_id: instructor.id,
        is_published: true,
        requirements: ['HTML and CSS basics'],
        learning_outcomes: [
          'Master JavaScript syntax',
          'Work with DOM manipulation',
          'Handle events and user interactions',
          'Write clean, maintainable code'
        ]
      }
    ];

    for (const courseData of freeCourses) {
      await prisma.course.upsert({
        where: { id: courseData.id },
        update: {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          level: courseData.level,
          price: courseData.price,
          duration_weeks: courseData.duration_weeks,
          language: courseData.language,
          instructor_id: courseData.instructor_id,
          is_published: courseData.is_published,
          requirements: courseData.requirements,
          learning_outcomes: courseData.learning_outcomes
        },
        create: courseData
      });
    }

    console.log('Free courses created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main();