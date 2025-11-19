import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import {
  getCertificates,
  getCertificate,
  issueCertificate
} from '../controllers/certificates.controller.js';

const router = Router();

router.get('/', auth, getCertificates);
router.get('/:id', auth, getCertificate);
router.post('/', auth, issueCertificate);

export default router;