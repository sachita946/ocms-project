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

const router = Router();

// Health check
router.get('/', (req, res) => res.json({ ok: true, message: 'API running' }));
router.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

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

export default router;
