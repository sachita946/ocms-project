import { prisma } from '../utils/prisma-client.js';

// Get all students enrolled in instructor's courses
export const getInstructorStudents = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: { instructor_id: instructorId },
      select: { id: true, title: true }
    });

    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return res.json([]);
    }

    // Get all enrollments for these courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course_id: { in: courseIds }
      },
      include: {
        student: {
          include: {
            user: true
          }
        },
        course: true,
        progress: true
      }
    });

    // Group by student
    const studentMap = new Map();

    enrollments.forEach(enrollment => {
      const studentId = enrollment.student_id;
      const student = enrollment.student;

      if (!studentMap.has(studentId)) {
        // Calculate overall progress for this student across all courses
        const totalLessons = enrollment.progress.length;
        const completedLessons = enrollment.progress.filter(p => p.is_completed).length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        studentMap.set(studentId, {
          id: studentId,
          name: `${student.user.first_name} ${student.user.last_name}`.trim(),
          email: student.user.email,
          enrolledAt: enrollment.enrolled_at,
          courses: [],
          progress: progressPercentage
        });
      }

      // Add course to student's courses
      studentMap.get(studentId).courses.push({
        id: enrollment.course.id,
        title: enrollment.course.title,
        enrolledAt: enrollment.enrolled_at,
        status: enrollment.completion_status
      });
    });

    const students = Array.from(studentMap.values());
    res.json(students);
  } catch (error) {
    console.error('getInstructorStudents error:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// Get all quizzes created by instructor
export const getInstructorQuizzes = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: { instructor_id: instructorId },
      include: {
        lessons: {
          include: {
            quiz: {
              include: {
                questions: true,
                attempts: {
                  include: {
                    student: {
                      include: {
                        user: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const quizzes = [];

    courses.forEach(course => {
      course.lessons.forEach(lesson => {
        if (lesson.quiz) {
          const quiz = lesson.quiz;
          const totalAttempts = quiz.attempts.length;
          const passedAttempts = quiz.attempts.filter(a => a.is_passed).length;
          const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

          quizzes.push({
            id: quiz.id,
            title: quiz.title,
            courseName: course.title,
            lessonTitle: lesson.title,
            questions: quiz.questions.length,
            attempts: totalAttempts,
            passRate: passRate,
            passingScore: quiz.passing_score,
            published: true // Assuming all quizzes are published for now
          });
        }
      });
    });

    res.json(quizzes);
  } catch (error) {
    console.error('getInstructorQuizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

// Get instructor profile
export const getInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { user_id: instructorId },
      include: {
        user: true
      }
    });

    if (!instructorProfile) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }

    res.json({
      id: instructorProfile.id,
      user_id: instructorProfile.user_id,
      full_name: instructorProfile.full_name,
      phone: instructorProfile.phone,
      profile_picture: instructorProfile.profile_picture,
      bio: instructorProfile.bio,
      expertise_area: instructorProfile.expertise_area,
      website: instructorProfile.website,
      qualifications: instructorProfile.qualifications,
      experience_years: instructorProfile.experience_years,
      is_verified: instructorProfile.is_verified,
      is_pending_approval: instructorProfile.is_pending_approval,
      user: {
        first_name: instructorProfile.user.first_name,
        last_name: instructorProfile.user.last_name,
        email: instructorProfile.user.email
      }
    });
  } catch (error) {
    console.error('getInstructorProfile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update instructor profile
export const updateInstructorProfile = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const {
      full_name,
      phone,
      bio,
      expertise_area,
      website,
      qualifications,
      experience_years
    } = req.body;

    const updatedProfile = await prisma.instructorProfile.update({
      where: { user_id: instructorId },
      data: {
        full_name,
        phone,
        bio,
        expertise_area,
        website,
        qualifications,
        experience_years: experience_years ? parseInt(experience_years) : null
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('updateInstructorProfile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Get student progress for instructor's courses
export const getStudentProgress = async (req, res) => {
  try {
    const instructorId = req.user.id;

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: { instructor_id: instructorId },
      include: {
        enrollments: {
          include: {
            student: {
              include: {
                user: true
              }
            },
            progress: {
              include: {
                lesson: true
              }
            }
          }
        }
      }
    });

    const progressData = courses.map(course => ({
      courseId: course.id,
      courseTitle: course.title,
      students: course.enrollments.map(enrollment => {
        const student = enrollment.student;
        const progress = enrollment.progress;

        const totalLessons = progress.length;
        const completedLessons = progress.filter(p => p.is_completed).length;
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          id: student.id,
          name: `${student.user.first_name} ${student.user.last_name}`.trim(),
          email: student.user.email,
          progress: progressPercentage,
          completedLessons,
          totalLessons,
          lastActivity: progress.length > 0 ?
            new Date(Math.max(...progress.map(p => new Date(p.updated_at || p.created_at)))) :
            null
        };
      })
    }));

    res.json(progressData);
  } catch (error) {
    console.error('getStudentProgress error:', error);
    res.status(500).json({ message: 'Failed to fetch student progress' });
  }
};