
import crypto from 'crypto';
import prisma from '../utils/prisma-client.js';

// Create payment with SHA-256 transaction_id
async function createPayment(studentId, courseId, amount, method) {
  const timestamp = Date.now();
  const transactionId = crypto
    .createHash('sha256')
    .update(studentId.toString() + courseId.toString() + amount.toString() + timestamp)
    .digest('hex');

  return await prisma.payment.create({
    data: {
      student_id: studentId,
      course_id: courseId,
      amount,
      payment_method: method,
      transaction_id: transactionId,
      status: 'PENDING',
    },
  });
}

// Pay for course
export const payCourse = async (req, res) => {
  try {
    const studentId = req.studentProfileId;
    const { course_id, amount, payment_method } = req.body;

    if (!studentId) return res.status(400).json({ message: 'Student profile not found' });
    if (!course_id || !amount || !payment_method) return res.status(400).json({ message: 'Missing required fields' });

    const payment = await createPayment(studentId, course_id, amount, payment_method);

    return res.status(201).json(payment);
  } catch (err) {
    console.error('payCourse', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all payments for student
export const getPayments = async (req, res) => {
  try {
    const studentId = req.studentProfileId;
    if (!studentId) return res.status(400).json({ message: 'Student profile not found' });

    const payments = await prisma.payment.findMany({
      where: { student_id: studentId },
      include: { course: true },
    });
    res.json(payments);
  } catch (err) {
    console.error('getPayments', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const updated = await prisma.payment.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (err) {
    console.error('updatePaymentStatus', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};