import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testInsert() {
  try {
    const resource = await prisma.courseResource.create({
      data: {
        course_id: 1,
        type: 'zoom',
        title: 'Live Session - Week 1',
        content: 'Join our first live session to discuss course overview',
        zoom_link: 'https://zoom.us/j/123456789',
        user_id: 9
      }
    });
    console.log('Success:', resource);
  } catch (error) {
    console.error('Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testInsert();