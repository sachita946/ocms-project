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

// GET single user by ID — protected
router.get('/:id', auth, getOneUser);

// CREATE a new user — public
router.post('/', createUser);

// LOGIN — public
router.post('/login', loginUser);

// UPDATE user by ID — protected
router.put('/:id', auth, updateUser);

// DELETE user by ID — protected
router.delete('/:id', auth, deleteUser);

// Example route for profile — protected
router.get('/profile', auth, (req, res) => {
  res.send('Hello from profile');
});

export default router;
