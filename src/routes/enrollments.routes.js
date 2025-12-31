import { Router } from 'express';
import {auth} from '../middleware/auth.js';
import {
  enrollInCourse,
  getMyEnrollments,
  getEnrollment,
  getCourseEnrollments,
  getStudentProgressDetail,
  unenroll
} from '../controllers/enrollments.controller.js';

const router = Router();

router.post('/', auth, enrollInCourse);
router.get('/me', auth, getMyEnrollments);
router.get('/course/:courseId/students', auth, getCourseEnrollments);
router.get('/:id/progress-detail', auth, getStudentProgressDetail);
router.get('/:id', auth, getEnrollment);
router.delete('/:id', auth, unenroll);

export default router;
// import { Router } from 'express';
// import { auth } from '../middleware/auth.js';
// import { enroll, myEnrollments } from '../controllers/enrollments.controller.js';

// const router = Router();

// router.post('/', auth, enroll);          // POST /api/enrollments
// router.get('/me', auth, myEnrollments);  // GET /api/enrollments/me

// export default router;