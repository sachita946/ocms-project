
import Stripe from 'stripe';
import { prisma } from '../utils/prisma-client.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey || 'sk_test_your_stripe_secret_key_here');

// Create payment intent for Stripe
export const createPaymentIntent = async (req, res) => {
  try {
    // Check if Stripe is properly configured
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_stripe_secret_key_here') {
      return res.status(500).json({
        message: 'Stripe payment system is not configured. Please contact support.'
      });
    }

    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const { course_id, amount } = req.body;

    if (!course_id || !amount) {
      return res.status(400).json({ message: 'Missing required fields: course_id, amount' });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(course_id) }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found. The course may have been deleted or is no longer available.' });
    }

    // Check if course is published
    if (!course.is_published) {
      return res.status(400).json({ message: 'This course is not currently available for enrollment.' });
    }

    // Check if already paid
    const existingPayment = await prisma.payment.findFirst({
      where: {
        student_id: studentProfile.id,
        course_id: parseInt(course_id),
        status: 'COMPLETED'
      }
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'You have already paid for this course' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100), // Amount is in NPR, convert to paisa (100 paisa = 1 NPR)
      currency: 'npr', // Use Nepalese Rupee
      metadata: {
        course_id: course_id.toString(),
        student_id: studentProfile.id.toString(),
        course_title: course.title
      },
      description: `Payment for ${course.title}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        student_id: studentProfile.id,
        course_id: parseInt(course_id),
        amount: parseFloat(amount),
        payment_method: 'STRIPE',
        transaction_id: paymentIntent.id,
        status: 'PENDING',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      payment_id: payment.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
};

// Confirm payment and create enrollment
export const confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id, payment_id } = req.body;

    if (!payment_intent_id || !payment_id) {
      return res.status(400).json({ message: 'Missing payment_intent_id or payment_id' });
    }

    // Validate payment_id is a valid integer
    const paymentIdInt = parseInt(payment_id);
    if (isNaN(paymentIdInt) || paymentIdInt <= 0) {
      return res.status(400).json({ message: `Invalid payment_id format: ${payment_id}` });
    }

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update payment status in database
    const payment = await prisma.payment.update({
      where: { id: paymentIdInt },
      data: {
        status: 'COMPLETED',
        transaction_id: payment_intent_id
      }
    });

    // Create enrollment
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: studentProfile.id,
        course_id: payment.course_id
      }
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          student_id: studentProfile.id,
          course_id: payment.course_id,
          completion_status: 'ACTIVE'
        }
      });
    }

    // Create instructor earning record
    const course = await prisma.course.findUnique({
      where: { id: payment.course_id },
      include: { instructor: { include: { instructorProfile: true } } }
    });

    if (course && course.instructor.instructorProfile) {
      const platformFee = 0.1; // 10% platform fee
      const netAmount = parseFloat(payment.amount) * (1 - platformFee);

      await prisma.instructorEarning.create({
        data: {
          instructor_id: course.instructor.instructorProfile.id,
          course_id: payment.course_id,
          payment_id: payment.id,
          amount: parseFloat(payment.amount),
          platform_fee: platformFee,
          net_amount: netAmount,
          status: 'PENDING'
        }
      });
    }

    res.json({
      message: 'Payment confirmed and enrollment created',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        transaction_id: payment.transaction_id
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

// Get all payments for student
export const getPayments = async (req, res) => {
  try {
    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const studentId = studentProfile.id;

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
        updated_at: 'desc'
      }
    });

    const formattedPayments = payments.map(p => ({
      id: p.id,
      course: p.course,
      amount: p.amount,
      currency: 'NPR',
      formatted_amount: `NPR ${parseFloat(p.amount).toLocaleString()}`,
      payment_method: p.payment_method,
      transaction_id: p.transaction_id,
      status: p.status,
      created_at: p.paid_at
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

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status }
    });

    res.json(updatedPayment);
  } catch (err) {
    console.error('updatePaymentStatus error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create payment record (for ESEWA and other payment methods)
export const createPayment = async (req, res) => {
  try {
    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const { course_id, amount, payment_method, transaction_id, status } = req.body;

    if (!course_id || !amount || !payment_method || !transaction_id) {
      return res.status(400).json({
        message: 'Missing required fields: course_id, amount, payment_method, transaction_id'
      });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(course_id) }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is published
    if (!course.is_published) {
      return res.status(400).json({ message: 'This course is not currently available for enrollment.' });
    }

    // Check if already paid
    const existingPayment = await prisma.payment.findFirst({
      where: {
        student_id: studentProfile.id,
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
        student_id: studentProfile.id,
        course_id: parseInt(course_id),
        amount: parseFloat(amount),
        payment_method: payment_method.toUpperCase(),
        transaction_id: transaction_id,
        status: status || 'COMPLETED',
      },
    });

    // If payment is completed, create enrollment automatically
    if (payment.status === 'COMPLETED') {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          student_id: studentProfile.id,
          course_id: parseInt(course_id)
        }
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            student_id: studentProfile.id,
            course_id: parseInt(course_id),
            completion_status: 'ACTIVE'
          }
        });
      }

      // Create instructor earning record
      const courseWithInstructor = await prisma.course.findUnique({
        where: { id: parseInt(course_id) },
        include: { instructor: { include: { instructorProfile: true } } }
      });

      if (courseWithInstructor && courseWithInstructor.instructor.instructorProfile) {
        const platformFee = 0.1; // 10% platform fee
        const netAmount = parseFloat(amount) * (1 - platformFee);

        await prisma.instructorEarning.create({
          data: {
            instructor_id: courseWithInstructor.instructor.instructorProfile.id,
            course_id: parseInt(course_id),
            payment_id: payment.id,
            amount: parseFloat(amount),
            platform_fee: platformFee,
            net_amount: netAmount,
            status: 'PENDING'
          }
        });
      }
    }

    res.status(201).json({
      message: payment.status === 'COMPLETED' ? 'Payment processed and enrollment created' : 'Payment created',
      payment: {
        id: payment.id,
        course_id: payment.course_id,
        amount: payment.amount,
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        status: payment.status,
        created_at: payment.paid_at
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};