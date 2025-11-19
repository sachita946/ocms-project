import { Router } from 'express';
import { register, login, profile } from '../controllers/users.controller.js';
import { auth } from '../middleware/auth.js';
import usersRouter from './users.routes.js';
import coursesRouter from './courses.routes.js';
import lessonsRouter from './lessons.routes.js';
import resourcesRouter from './resources.routes.js';
import enrollmentsRouter from './resources.routes.js';
import quizzesRouter from './quizzes.routes.js';
import certificatesRouter from './certificates.routes.js';
import paymentsRouter from './payments.routes.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, profile);
router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/lessons', lessonsRouter);
router.use('/resources', resourcesRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/quizzes', quizzesRouter);
router.use('/certificates', certificatesRouter);
router.use('/payments', paymentsRouter);

export default router;
// import {Router} from 'express';
// import {auth} from './../middleware/auth.js';
// import {getAllUsers,createUser,getOneUser,loginUser,updateUser,deleteUser} from './../controller/users.controller.js';
// const router = Router();

// router.get('/',getAllUsers);
// //can get only one id
// router.get('/:id',getOneUser);
// router.post('/',createUser)

// //delete
// router.delete('/:id',deleteUser);
// //update
// router.put('/:id',auth,updateUser);

// router.post('/login',loginUser);



// router.get('/profile',(req,res)=>{
//   res.send('hello from profile')
// });
// export default router;