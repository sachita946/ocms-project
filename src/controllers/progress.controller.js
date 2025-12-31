import {prisma} from '../utils/prisma-client.js';

export const markLessonComplete = async (req, res) => {
  try {
    const studentProfileId = req.studentProfileId;
    if (!studentProfileId) return res.status(400).json({ message: 'Student profile not found' });

    const { enrollment_id, lesson_id } = req.body;
    if (!enrollment_id || !lesson_id) return res.status(400).json({ message: 'enrollment_id and lesson_id required' });

    // Verify the enrollment belongs to the student
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parseInt(enrollment_id) },
      include: { student: true }
    });

    if (!enrollment || enrollment.student.id !== studentProfileId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // create progress entry (unique compound prevents duplicates)
    const p = await prisma.progress.create({ 
      data: { 
        enrollment_id: parseInt(enrollment_id), 
        lesson_id: parseInt(lesson_id), 
        is_completed: true, 
        completed_at: new Date() 
      },
      include: { lesson: true, enrollment: true }
    });
    return res.status(201).json(p);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Already marked completed' });
    console.error('markLessonComplete', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProgressByEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const prog = await prisma.progress.findMany({ 
      where: { enrollment_id: parseInt(enrollmentId) }, 
      include: { 
        lesson: true,
        enrollment: {
          include: {
            student: {
              include: { user: true }
            },
            course: true
          }
        }
      },
      orderBy: { completed_at: 'desc' }
    });
    return res.json(prog);
  } catch (err) {
    console.error('getProgressByEnrollment', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all students' progress for a course (instructor view)
export const getCourseProgressStats = async (req, res) => {
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

    // Get all enrollments for the course with progress
    const enrollments = await prisma.enrollment.findMany({
      where: { course_id: parseInt(courseId) },
      include: {
        student: {
          include: { user: true }
        },
        progress: true
      }
    });

    // Get total lessons in course
    const totalLessons = await prisma.lesson.count({
      where: { course_id: parseInt(courseId) }
    });

    // Calculate progress for each student
    const progressData = enrollments.map(enrollment => {
      const completedCount = enrollment.progress.filter(p => p.is_completed).length;
      return {
        enrollmentId: enrollment.id,
        studentName: enrollment.student.user.first_name + ' ' + enrollment.student.user.last_name,
        studentEmail: enrollment.student.user.email,
        enrolledAt: enrollment.enrolled_at,
        completedLessons: completedCount,
        totalLessons,
        progressPercentage: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
        completionStatus: enrollment.completion_status,
        lastAccessed: enrollment.last_accessed
      };
    });

    res.json({
      courseName: course.title,
      totalStudents: enrollments.length,
      averageProgress: Math.round(
        progressData.reduce((sum, p) => sum + p.progressPercentage, 0) / (progressData.length || 1)
      ),
      students: progressData.sort((a, b) => b.progressPercentage - a.progressPercentage)
    });
  } catch (err) {
    console.error('getCourseProgressStats', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all students progress across all courses (admin view)
export const getAllStudentsProgress = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
          include: { user: true }
        },
        course: true,
        progress: true
      },
      take: 100 // Limit for performance
    });

    const progressData = enrollments.map(enrollment => {
      const completedCount = enrollment.progress.filter(p => p.is_completed).length;
      const totalLessons = enrollment.course.duration_weeks || 10;
      
      return {
        enrollmentId: enrollment.id,
        studentName: enrollment.student.user.first_name + ' ' + enrollment.student.user.last_name,
        studentEmail: enrollment.student.user.email,
        courseName: enrollment.course.title,
        courseId: enrollment.course.id,
        enrolledAt: enrollment.enrolled_at,
        completedLessons: completedCount,
        completionStatus: enrollment.completion_status,
        progressPercentage: Math.round((completedCount / (totalLessons || 1)) * 100)
      };
    });

    res.json(progressData);
  } catch (err) {
    console.error('getAllStudentsProgress', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};