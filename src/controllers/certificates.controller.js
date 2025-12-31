import {prisma} from '../utils/prisma-client.js';
import { randomBytes } from 'crypto';

function generateCode(len = 10) {
  return randomBytes(Math.ceil(len / 2)).toString('hex').toUpperCase().slice(0, len);
}

export const issueCertificate = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) return res.status(400).json({ message: 'user_id and course_id required' });

    const code = generateCode(10);
    const cert = await prisma.certificate.create({
      data: { user_id, course_id, code }
    });

    return res.status(201).json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Code required' });

    const cert = await prisma.certificate.findUnique({
      where: { code },
      include: { user: true, course: true }
    });

    if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });

    return res.json({
      valid: true,
      certificate: {
        id: cert.id,
        code: cert.code,
        issuedAt: cert.issuedAt,
        user: { id: cert.user.id, name: `${cert.user.first_name} ${cert.user.last_name}`, email: cert.user.email },
        course: { id: cert.course.id, title: cert.course.title }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const createCertificate = async (req, res) => {
  try {
    const { student_id, course_id, certificate_url } = req.body;

    if (!student_id || !course_id || !certificate_url) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Auto-generate a unique verification code
    const verification_code = Math.random().toString(36).substr(2, 10).toUpperCase();

    const certificate = await prisma.certificate.create({
      data: { student_id: Number(student_id), course_id: Number(course_id), certificate_url, verification_code },
      include: {
        student: true,
        course: true
      }
    });

    res.status(201).json(certificate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listCertificates = async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      include: {
        student: true,
        course: true
      }
    });
    res.json(certificates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.certificate.delete({ where: { id: Number(id) } });
    res.json({ message: "Certificate deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
