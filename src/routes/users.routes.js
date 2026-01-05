import { Router } from 'express';
import { auth } from './../middleware/auth.js';
import {
  getAllUsers,
  createUser,
  getOneUser,
  loginUser,
  updateUser,
  deleteUser
} from './../controllers/users.controller.js';

const router = Router();

// GET all users — protected
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getOneUser);

// CREATE a new user — public
router.post('/', createUser);
router.post('/login', loginUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

// Example route for profile — protected
router.get('/profile', auth, (req, res) => {
  res.send('Hello from profile');
});

export default router;
