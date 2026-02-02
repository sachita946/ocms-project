
import {prisma} from '../utils/prisma-client.js';

export const enrollInCourse = async (req, res) => {
  try {
    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const studentId = studentProfile.id;
    const { course_id } = req.body;

    // Check if course exists and get its price
    const course = await prisma.course.findUnique({
      where: { id: parseInt(course_id) }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If course has a price, check for completed payment
    if (course.price && course.price > 0) {
      const payment = await prisma.payment.findFirst({
        where: {
          student_id: studentId,
          course_id: parseInt(course_id),
          status: 'COMPLETED'
        }
      });

      if (!payment) {
        return res.status(400).json({ 
          message: 'Payment required for this course. Please complete payment first.' 
        });
      }
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { student_id: studentId, course_id: parseInt(course_id) }
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        student_id: studentId,
        course_id: parseInt(course_id),
        enrollment_code: `ENR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    });
    res.status(201).json(enrollment);
  } catch (err) {
    console.error('enrollInCourse', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyEnrollments = async (req, res) => {
  try {
    console.log('getMyEnrollments: User ID from token:', req.user.id);

    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    console.log('getMyEnrollments: Student profile found:', !!studentProfile);
    if (studentProfile) {
      console.log('getMyEnrollments: Student profile ID:', studentProfile.id);
    }

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: studentProfile.id },
      include: {
        course: true,
        progress: {
          include: { lesson: true }
        }
      }
    });

    console.log('getMyEnrollments: Found enrollments:', enrollments.length);
    console.log('getMyEnrollments: Enrollments data:', JSON.stringify(enrollments, null, 2));

    res.json(enrollments);
  } catch (err) {
    console.error('getMyEnrollments', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await prisma.enrollment.findUnique({ 
      where: { id: parseInt(id) }, 
      include: { 
        course: true,
        progress: {
          include: { lesson: true }
        }
      } 
    });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json(enrollment);
  } catch (err) {
    console.error('getEnrollment', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get course enrollments for instructor
export const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verify instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    });
    
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { course_id: parseInt(courseId) },
      include: {
        student: {
          include: { user: true }
        },
        progress: {
          include: { lesson: true }
        }
      },
      orderBy: { enrolled_at: 'desc' }
    });

    res.json(enrollments);
  } catch (err) {
    console.error('getCourseEnrollments', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get student progress for a specific enrollment (instructor view)
export const getStudentProgressDetail = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollmentId) },
      include: {
        course: true,
        student: {
          include: { user: true }
        },
        progress: {
          include: { lesson: true },
          orderBy: { completed_at: 'desc' }
        }
      }
    });

    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    
    // Verify authorization
    const course = enrollment.course;
    if (course.instructor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Calculate progress percentage
    const totalLessons = await prisma.lesson.count({ where: { course_id: course.id } });
    const completedLessons = enrollment.progress.filter(p => p.is_completed).length;
    const progressPercentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.json({
      ...enrollment,
      progressPercentage,
      completedLessons,
      totalLessons
    });
  } catch (err) {
    console.error('getStudentProgressDetail', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const unenroll = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { student: true }  // Include to get user_id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Compare correct IDs - enrollment.student_id is integer, req.user.id is UUID
    if (req.user.role !== 'ADMIN' && enrollment.student.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.enrollment.delete({ where: { id } });
    res.json({ message: 'Unenrolled successfully' });
  } catch (err) {
    console.error('[enrollments.unenroll]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyEnrollmentsWithDetails = async (req, res) => {
  try {
    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: studentProfile.id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        },
        progress: {
          include: {
            lesson: true
          }
        }
      }
    });

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.lessons?.length || 0;
      const completedLessons = enrollment.progress?.length || 0;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...enrollment,
        progress: progress
      };
    });

    res.json(enrollmentsWithProgress);
  } catch (err) {
    console.error('getMyEnrollmentsWithDetails', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};