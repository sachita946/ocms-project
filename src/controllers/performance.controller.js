import {prisma} from '../utils/prisma-client.js';

export const getMyPerformance = async (req, res) => {
  try {
    const studentProfileId = req.studentProfileId;
    if (!studentProfileId) return res.status(400).json({ message: 'Student profile not found' });

    const enrollments = await prisma.enrollment.findMany({ where: { student_id: studentProfileId }, include: { course: true } });
    const certificates = await prisma.certificate.findMany({ where: { student_id: studentProfileId }, include: { course: true } });
    const attempts = await prisma.quizAttempt.findMany({ where: { student_id: studentProfileId }, include: { quiz: true }, orderBy: { id: 'desc' } });

    // avg score
    let avgPercent = null;
    if (attempts.length) {
      const totalPercent = attempts.reduce((acc, a) => {
        if (!a.quiz?.total_marks) return acc;
        return acc + (a.score / (a.quiz.total_marks || 1)) * 100;
      }, 0);
      avgPercent = Math.round((totalPercent / attempts.length) * 100) / 100;
    }

    // per-course progress using Progress & Quiz counts
    const courseStats = [];
    for (const en of enrollments) {
      const c = en.course;
      const lessonsCount = await prisma.lesson.count({ where: { course_id: c.id } });
      const completedCount = await prisma.progress.count({
        where: { enrollment_id: en.id, is_completed: true }
      });
      const quizzesCount = await prisma.quiz.count({ where: { lesson: { course_id: c.id } } }).catch(() => 0);
      // attempts for this course
      const attemptsForCourse = attempts.filter(a => a.quiz && a.quiz.lesson && a.quiz.lesson.course_id === c.id);
      const passedCount = attemptsForCourse.filter(a => a.is_passed).length;

      const progressPercent = lessonsCount ? Math.round((completedCount / lessonsCount) * 100) : null;
      courseStats.push({
        course_id: c.id,
        title: c.title,
        enrolled_at: en.enrolled_at,
        lessons_total: lessonsCount,
        lessons_completed: completedCount,
        quizzes_total: quizzesCount,
        quizzes_passed: passedCount,
        progress_percent: progressPercent
      });
    }

    const recentAttempts = attempts.slice(0, 10).map(a => ({
      id: a.id, quiz_id: a.quiz_id, score: a.score, passed: a.is_passed, taken_at: a.id // no createdAt field in this schema; use id as placeholder
    }));

    return res.json({
      total_enrollments: enrollments.length,
      total_certificates: certificates.length,
      average_quiz_percent: avgPercent,
      course_stats: courseStats,
      recent_attempts: recentAttempts
    });
  } catch (err) {
    console.error('getMyPerformance', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};