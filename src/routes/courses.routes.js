import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/courses.controller.js';

const router = Router();

router.get('/', getAllCourses);
router.get('/:id', getCourse);
router.post('/', auth, requireRole(['INSTRUCTOR', 'ADMIN']), createCourse);
router.put('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), updateCourse);
router.delete('/:id', auth, requireRole(['INSTRUCTOR', 'ADMIN']), deleteCourse);

export default router;
// import {Router} from 'express';
// import {auth} from './../middleware/auth.js';
// import {getAllCourse,createCourse,getOneCourse,loginCourse,updateCourse,deleteCourse} from './../controller/course.controller.js';
// const router = Router();

// router.get('/',getAllCourse);
// //can get only one id
// router.get('/:id',getOneCourse);
// //create course 
// router.post('/',createCourse)

// //delete
// router.delete('/:id',deleteCourse);
// //update
// router.put('/:id',auth,updateCourse);

// router.post('/login',loginCourse);



// router.get('/profile',(req,res)=>{
//   res.send('hello from profile')
// });
// export default router;