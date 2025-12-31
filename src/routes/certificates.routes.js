import { Router } from "express";
import  {auth}  from "../middleware/auth.js";
import {issueCertificate, verifyCertificate, createCertificate, listCertificates, deleteCertificate } from "../controllers/certificates.controller.js";

const router = Router();
router.post('/issue', auth, issueCertificate);
router.post('/verify', verifyCertificate);
router.post('/', auth, createCertificate);
router.get('/', auth, listCertificates);
router.delete('/:id', auth, deleteCertificate);

export default router;
