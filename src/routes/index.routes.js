import { Router } from 'express';
import usersRouter from './users.routes.js';
import coursesRouter from './courses.routes.js';
import lessonsRouter from './lessons.routes.js';
import enrollmentsRouter from './enrollments.routes.js';
import quizzesRouter from './quizzes.routes.js';
import certificatesRouter from './certificates.routes.js';
import paymentsRouter from './payments.routes.js';
import passwordRouter from './password.routes.js';
import performanceRouter from './performance.routes.js'; 
import progressRouter from './progress.routes.js';
import profileDashboardRouter from './profileDashboard.routes.js';
import videonotesRoutes from "./videonotes.routes.js";
import notificationsRoutes from "./notifications.routes.js";
import activitiesRoutes from "./activities.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import oauthRoutes from "./oauth.routes.js";
import courseResourcesRoutes from "./courseResources.routes.js";
import lessonResourcesRoutes from "./lessonResources.routes.js";
import zoomRoutes from "./zoom.routes.js";
import instructorEarningsRoutes from "./instructor-earnings.routes.js";

const router = Router();

// Health check
router.get('/', (req, res) => res.json({ ok: true, message: 'API running' }));
router.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Debug endpoint (no auth required for testing)
router.get('/debug', async (req, res) => {
  try {
    const { prisma } = await import('../utils/prisma-client.js');

    const users = await prisma.user.findMany();
    const profiles = await prisma.studentProfile.findMany();
    const enrollments = await prisma.enrollment.findMany({
      include: { course: true }
    });
    const payments = await prisma.payment.findMany();

    res.json({
      users: users.map(u => ({ id: u.id, email: u.email, role: u.role })),
      studentProfiles: profiles.map(p => ({ id: p.id, user_id: p.user_id })),
      enrollments: enrollments.map(e => ({
        id: e.id,
        student_id: e.student_id,
        course_id: e.course_id,
        course_title: e.course?.title
      })),
      payments: payments.map(p => ({
        id: p.id,
        student_id: p.student_id,
        course_id: p.course_id,
        status: p.status
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test token decoding
router.post('/test-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    const { verifyToken } = await import('../utils/jwt.js');
    const decoded = verifyToken(token);
    if (decoded) {
      res.json({ decoded, valid: true });
    } else {
      res.json({ valid: false, error: 'Invalid token' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Main routes
router.use('/users', usersRouter);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/courses', coursesRouter);
router.use('/lessons', lessonsRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/quizzes', quizzesRouter);
router.use('/certificates', certificatesRouter);
router.use('/payments', paymentsRouter);
router.use('/password', passwordRouter);
router.use('/performance', performanceRouter);
router.use('/progress', progressRouter);
router.use('/profile', profileDashboardRouter);
router.use('/videonotes', videonotesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/activities', activitiesRoutes);
router.use('/oauth', oauthRoutes);
router.use('/course-resources', courseResourcesRoutes);
router.use('/lesson-resources', lessonResourcesRoutes);
router.use('/zoom', zoomRoutes);
router.use('/instructor-earnings', instructorEarningsRoutes);

export default router;
