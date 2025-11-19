import prisma from '../utils/prisma-client.js';
// Issue certificate with SHA-256 verification_code
export const issueCertificate = async (req, res) => {
  try {
    const { student_id, course_id, certificate_url } = req.body;
    const studentId = student_id ?? req.user.id;
    const timestamp = Date.now();

    const verification_code = crypto
      .createHash('sha256')
      .update(studentId.toString() + course_id.toString() + timestamp)
      .digest('hex');

    const cert = await prisma.certificate.create({
      data: {
        student_id: studentId,
        course_id,
        certificate_url: certificate_url ?? null,
        verification_code,
      },
    });

    res.status(201).json(cert);
  } catch (err) {
    console.error('issueCertificate', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all certificates
export const getCertificates = async (req, res) => {
  try {
    const studentId = req.user.id;
    const certs = await prisma.certificate.findMany({
      where: { student_id: studentId },
      include: { course: true },
    });
    res.json(certs);
  } catch (err) {
    console.error('getCertificates', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single certificate
export const getCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const cert = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
      include: { course: true },
    });
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (err) {
    console.error('getCertificate', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};