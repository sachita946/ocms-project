import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { addNote, listNotes, updateNote, deleteNote } from'../controllers/videonotes.controller.js';

const router = Router();

router.post('/', auth, addNote);
router.get('/', auth, listNotes);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);

export default router;