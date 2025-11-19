import crypto from 'crypto';
import prisma from './utils/prisma-client.js';

// Function to generate enrollment with SHA-256 enrollment_code
async function createEnrollment(studentId, courseId) {
  const timestamp = Date.now();
  const enrollmentCode = crypto
    .createHash('sha256')
    .update(studentId.toString() + courseId.toString() + timestamp)
    .digest('hex');

  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: studentId,
      course_id: courseId,
      enrollment_code: enrollmentCode,
    },
  });

  return enrollment;
}

// Controller: Enroll student in course
export const enroll = async (req, res) => {
  try {
    const studentProfileId = req.studentProfileId;
    if (!studentProfileId) return res.status(400).json({ message: 'Student profile not found' });

    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ message: 'course_id required' });

    // Use the function that generates SHA-256 enrollment code
    const enrollment = await createEnrollment(studentProfileId, course_id);

    return res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Already enrolled' });
    console.error('enroll', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller: List my enrollments
export const myEnrollments = async (req, res) => {
  try {
    const studentProfileId = req.studentProfileId;
    if (!studentProfileId) return res.status(400).json({ message: 'Student profile not found' });

    const list = await prisma.enrollment.findMany({
      where: { student_id: studentProfileId },
      include: { course: true }
    });
    return res.json(list);
  } catch (err) {
    console.error('myEnrollments', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// import prisma from '../utils/prisma-client.js';

// export const enrollInCourse = async (req, res) => {
//   try {
//     const { course_id } = req.body;
//     const enrollment = await prisma.enrollment.create({
//       data: {
//         student_id: req.user.id,
//         course_id
//       }
//     });
//     res.status(201).json(enrollment);
//   } catch (err) {
//     console.error('enrollInCourse', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getMyEnrollments = async (req, res) => {
//   try {
//     const enrollments = await prisma.enrollment.findMany({
//       where: { student_id: req.user.id },
//       include: { course: true }
//     });
//     res.json(enrollments);
//   } catch (err) {
//     console.error('getMyEnrollments', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const getEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const enrollment = await prisma.enrollment.findUnique({ where: { id }, include: { course: true } });
//     if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
//     res.json(enrollment);
//   } catch (err) {
//     console.error('getEnrollment', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const unenroll = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const enrollment = await prisma.enrollment.findUnique({ where: { id } });
//     if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
//     if (req.user.role !== 'ADMIN' && enrollment.student_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
//     await prisma.enrollment.delete({ where: { id } });
//     res.json({ message: 'Unenrolled' });
//   } catch (err) {
//     console.error('unenroll', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };