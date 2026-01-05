
import crypto from 'crypto';
import {prisma} from '../utils/prisma-client.js';

// Create payment with SHA-256 transaction_id
async function createPayment(studentId, courseId, amount, method, transactionId = null) {
  const txId = transactionId || crypto
    .createHash('sha256')
    .update(studentId.toString() + courseId.toString() + amount.toString() + Date.now())
    .digest('hex');

  return await prisma.payment.create({
    data: {
      student_id: studentId,
      course_id: courseId,
      amount: parseFloat(amount), 
      payment_method: method,
      transaction_id: txId,
      status: 'PENDING',
    },
  });
}

// Pay for course
export const payCourse = async (req, res) => {
  try {
    const studentId = req.studentProfileId;
    const { course_id, amount, payment_method, transaction_id, status } = req.body;

    if (!studentId) return res.status(400).json({ message: 'Student profile not found' });
    if (!course_id || !amount || !payment_method) {
      return res.status(400).json({ message: 'Missing required fields: course_id, amount, payment_method' });
    }

    // Validate payment method
    const validMethods = ['KHALTI', 'ESEWA', 'BANK_TRANSFER'];
    if (!validMethods.includes(payment_method.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid payment method. Use KHALTI, ESEWA, or BANK_TRANSFER' });
    }
    const course = await prisma.course.findUnique({
      where: { id: parseInt(course_id) }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const existingPayment = await prisma.payment.findFirst({
      where: {
        student_id: studentId,
        course_id: parseInt(course_id),
        status: 'COMPLETED'
      }
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'You have already paid for this course' });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        student_id: studentId,
        course_id: parseInt(course_id),
        amount: parseFloat(amount),
        payment_method: payment_method.toUpperCase(),
        transaction_id: transaction_id || crypto
          .createHash('sha256')
          .update(studentId.toString() + course_id + amount.toString() + Date.now())
          .digest('hex'),
        status: status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
      },
    });

    // If payment is completed, create enrollment
    if (status === 'COMPLETED') {
      await prisma.enrollment.upsert({
        where: {
          student_id_course_id: {
            student_id: studentId,
            course_id: parseInt(course_id)
          }
        },
        update: {},
        create: {
          student_id: studentId,
          course_id: parseInt(course_id),
          status: 'ACTIVE',
          progress: 0
        }
      });
    }

    return res.status(201).json({
      message: 'Payment processed successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: 'NPR',
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        status: payment.status,
        created_at: payment.created_at
      }
    });
  } catch (err) {
    console.error('payCourse error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Get all payments for student
export const getPayments = async (req, res) => {
  try {
    const studentId = req.studentProfileId;
    if (!studentId) return res.status(400).json({ message: 'Student profile not found' });

    const payments = await prisma.payment.findMany({
      where: { student_id: studentId },
      include: { 
        course: {
          select: {
            id: true,
            title: true,
            price: true
          }
        } 
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    const formattedPayments = payments.map(p => ({
      ...p,
      amount: parseFloat(p.amount),
      currency: 'NPR',
      formatted_amount: `NPR ${parseFloat(p.amount).toLocaleString()}`
    }));

    res.json({ 
      payments: formattedPayments,
      currency: 'NPR'
    });
  } catch (err) {
    console.error('getPayments error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update payment status (Admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status },
    });
    if (status === 'COMPLETED' && payment.status !== 'COMPLETED') {
      await prisma.enrollment.upsert({
        where: {
          student_id_course_id: {
            student_id: payment.student_id,
            course_id: payment.course_id
          }
        },
        update: {},
        create: {
          student_id: payment.student_id,
          course_id: payment.course_id,
          status: 'ACTIVE',
          progress: 0
        }
      });
    }

    res.json({
      message: 'Payment status updated successfully',
      payment: updated
    });
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};