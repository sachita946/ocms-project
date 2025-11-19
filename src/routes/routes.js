// ...existing code...
import { Router } from 'express';
import usersRouter from './users.routes.js';
import coursesRouter from './courses.routes.js';
import lessonsRouter from './lessons.routes.js';
import resourcesRouter from './resources.routes.js';
import enrollmentsRouter from './enrollments.routes.js';
import quizzesRouter from './quizzes.routes.js';
import certificatesRouter from './certificates.routes.js';
import paymentsRouter from './payments.routes.js';
import passwordRouter from './password.routes.js';
import performanceRouter from './performance.routes.js'; 
import profileDashboard from './profileDashboard.routes.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/lessons', lessonsRouter);
router.use('/resources', resourcesRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/quizzes', quizzesRouter);
router.use('/certificates', certificatesRouter);
router.use('/payments', paymentsRouter);
router.use('/password', passwordRouter);
router.use('/performance', performanceRouter);
router.use('/profile-dashboard', profileDashboard);

export default router;

