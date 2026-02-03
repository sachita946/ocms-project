
import crypto from 'crypto';
import { prisma } from '../utils/prisma-client.js';

// eSewa Configuration
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_PAYMENT_URL = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/student/payment-success.html';
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/student/payment.html?payment_failed=true';

// eSewa Test Environment Limits
const ESEWA_MAX_AMOUNT = parseFloat(process.env.ESEWA_MAX_AMOUNT || '50000'); // Increased to 50k NPR for test
const ESEWA_MIN_AMOUNT = parseFloat(process.env.ESEWA_MIN_AMOUNT || '1'); // Minimum 1 NPR

// Create payment intent for eSewa
export const createPaymentIntent = async (req, res) => {
  try {
    // Check if eSewa is properly configured
    if (!ESEWA_MERCHANT_ID || ESEWA_MERCHANT_ID === 'your_esewa_merchant_id') {
      return res.status(500).json({
        message: 'eSewa payment system is not configured. Please contact support.'
      });
    }

    // Get or create student profile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      // Fetch user details from database to get name and email
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { first_name: true, last_name: true, email: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create a basic student profile if it doesn't exist
      try {
        studentProfile = await prisma.studentProfile.create({
          data: {
            user_id: req.user.id,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            interests: []
          }
        });
        console.log('Created student profile for user:', req.user.id);
      } catch (profileError) {
        console.error('Failed to create student profile:', profileError);
        return res.status(500).json({ message: 'Failed to initialize student profile. Please try again.' });
      }
    }

    const { course_id, amount } = req.body;

    if (!course_id || !amount) {
      return res.status(400).json({ message: 'Missing required fields: course_id, amount' });
    }

    // Validate amount limits for eSewa
    const paymentAmount = parseFloat(amount);
    if (paymentAmount < ESEWA_MIN_AMOUNT) {
      return res.status(400).json({
        message: `Payment amount must be at least NPR ${ESEWA_MIN_AMOUNT.toLocaleString()}`
      });
    }

    if (paymentAmount > ESEWA_MAX_AMOUNT) {
      return res.status(400).json({
        message: `Payment amount NPR ${paymentAmount.toLocaleString()} exceeds test environment limit of NPR ${ESEWA_MAX_AMOUNT.toLocaleString()}`,
        details: 'eSewa test environment has transaction limits. For testing higher amounts:',
        suggestions: [
          `Use amounts up to NPR ${ESEWA_MAX_AMOUNT.toLocaleString()} for testing`,
          'Contact eSewa support to increase test account limits',
          'Use production credentials for unlimited transactions',
          'Consider breaking large payments into smaller installments for testing'
        ],
        current_limit: ESEWA_MAX_AMOUNT,
        requested_amount: paymentAmount
      });
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
    const existingCompletedPayment = await prisma.payment.findFirst({
      where: {
        student_id: studentProfile.id,
        course_id: parseInt(course_id),
        status: 'COMPLETED'
      }
    });

    if (existingCompletedPayment) {
      return res.status(400).json({ message: 'You have already paid for this course' });
    }

    // Check for existing pending payment and reuse it
    let payment = await prisma.payment.findFirst({
      where: {
        student_id: studentProfile.id,
        course_id: parseInt(course_id),
        status: 'PENDING'
      }
    });

    if (payment) {
      // Reuse existing pending payment
      console.log('Reusing existing pending payment:', payment.id);
    } else {
      // Create new payment record in database first
      payment = await prisma.payment.create({
        data: {
          student_id: studentProfile.id, // Required field - references StudentProfile
          userId: req.user.id, // Optional field - references User
          course_id: parseInt(course_id),
          amount: parseFloat(amount),
          payment_method: 'ESEWA',
          transaction_id: `TXN_${Date.now()}_${req.user.id}`, // Use user ID
          status: 'PENDING',
        },
      });
    }

    // Generate eSewa payment signature
    const transaction_uuid = `OCMS-${payment.id}-${Date.now()}`;
    const total_amount = parseFloat(amount).toFixed(2);
    const product_code = ESEWA_MERCHANT_ID;
    
    // Create message for signature: total_amount,transaction_uuid,product_code
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(message).digest('base64');

    // Return eSewa payment form data
    res.json({
      payment_id: payment.id,
      transaction_uuid: transaction_uuid,
      amount: total_amount,
      currency: 'NPR',
      esewa_payment_url: ESEWA_PAYMENT_URL,
      esewa_params: {
        amount: total_amount,
        tax_amount: '0',
        total_amount: total_amount,
        transaction_uuid: transaction_uuid,
        product_code: product_code,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${ESEWA_SUCCESS_URL}?payment_id=${payment.id}`,
        failure_url: ESEWA_FAILURE_URL,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
};

// Confirm payment and create enrollment
export const confirmPayment = async (req, res) => {
  try {
    const { transaction_code, oid, payment_id, amt } = req.body;

    // eSewa returns: refId (transaction_code), oid (transaction_uuid), amt (amount)
    // We also accept payment_id from our custom success URL parameter

    if (!payment_id) {
      return res.status(400).json({ message: 'Missing payment_id' });
    }

    // For test environment, allow verification without transaction_code if explicitly configured
    const isTestMode = process.env.NODE_ENV !== 'production' || ESEWA_MERCHANT_ID === 'EPAYTEST';
    if (!transaction_code && !isTestMode) {
      return res.status(400).json({ message: 'Missing transaction_code. Payment verification failed.' });
    }

    if (!transaction_code && isTestMode) {
      console.warn('Test mode: Proceeding with payment verification without transaction_code');
    }

    // Validate payment_id is a valid integer
    const paymentIdInt = parseInt(payment_id);
    if (isNaN(paymentIdInt) || paymentIdInt <= 0) {
      return res.status(400).json({ message: `Invalid payment_id format: ${payment_id}` });
    }

    // Get or create student profile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      // Fetch user details from database to get name and email
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { first_name: true, last_name: true, email: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create a basic student profile if it doesn't exist
      try {
        studentProfile = await prisma.studentProfile.create({
          data: {
            user_id: req.user.id,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            interests: []
          }
        });
        console.log('Created student profile for user during payment confirmation:', req.user.id);
      } catch (profileError) {
        console.error('Failed to create student profile during payment confirmation:', profileError);
        return res.status(500).json({ message: 'Failed to initialize student profile. Please contact support.' });
      }
    }

    // Verify payment with eSewa (if transaction_code is provided, payment is successful)
    // In test mode, we allow verification without transaction_code
    if (!transaction_code && !isTestMode) {
      return res.status(400).json({ message: 'Payment verification failed - no transaction code provided' });
    }

    let payment;

    if (!transaction_code && isTestMode) {
      // Test mode: Auto-complete payment without eSewa verification
      console.log('Test mode: Auto-completing payment without eSewa verification');

      payment = await prisma.payment.update({
        where: { id: paymentIdInt },
        data: {
          status: 'COMPLETED',
          transaction_id: `TEST_${Date.now()}_${paymentIdInt}` // Test transaction ID
        },
        include: { course: true }
      });
    } else {
      // Normal eSewa verification
      payment = await prisma.payment.update({
        where: { id: paymentIdInt },
        data: {
          status: 'COMPLETED',
          transaction_id: transaction_code // Use eSewa's transaction code
        },
        include: { course: true }
      });
    }

    // Create enrollment after successful payment
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
      console.log('Enrollment created for user:', req.user.id, 'in course:', payment.course_id);
    } else {
      console.log('Enrollment already exists for user:', req.user.id, 'in course:', payment.course_id);
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
      message: (!transaction_code && isTestMode) ? 'Payment confirmed and enrollment created (Test Mode)' : 'Payment confirmed and enrollment created',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        transaction_id: payment.transaction_id
      },
      ...(isTestMode && !transaction_code && { test_mode: true })
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

// Mark payment as failed
export const failPayment = async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ message: 'Missing payment_id' });
    }

    // Validate payment_id is a valid integer
    const paymentIdInt = parseInt(payment_id);
    if (isNaN(paymentIdInt) || paymentIdInt <= 0) {
      return res.status(400).json({ message: `Invalid payment_id format: ${payment_id}` });
    }

    // Get or create student profile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Find the payment and ensure it belongs to the current user
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentIdInt,
        student_id: studentProfile.id,
        status: 'PENDING' // Only allow failing pending payments
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found or already processed' });
    }

    // Mark payment as failed
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentIdInt },
      data: {
        status: 'FAILED',
        transaction_id: `FAILED_${Date.now()}_${paymentIdInt}`
      }
    });

    console.log('Payment marked as failed:', paymentIdInt);

    res.json({
      message: 'Payment marked as failed',
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status
      }
    });

  } catch (error) {
    console.error('Fail payment error:', error);
    res.status(500).json({ message: 'Failed to mark payment as failed' });
  }
};

// Get all payments for student
export const getPayments = async (req, res) => {
  try {
    // Get or create student profile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      // Fetch user details from database to get name and email
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { first_name: true, last_name: true, email: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create a basic student profile if it doesn't exist
      try {
        studentProfile = await prisma.studentProfile.create({
          data: {
            user_id: req.user.id,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            interests: []
          }
        });
        console.log('Created student profile for user in getPayments:', req.user.id);
      } catch (profileError) {
        console.error('Failed to create student profile in getPayments:', profileError);
        return res.status(500).json({ message: 'Failed to initialize student profile. Please try again.' });
      }
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
    // Get or create student profile
    let studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      // Fetch user details from database to get name and email
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { first_name: true, last_name: true, email: true }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create a basic student profile if it doesn't exist
      try {
        studentProfile = await prisma.studentProfile.create({
          data: {
            user_id: req.user.id,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
            interests: []
          }
        });
        console.log('Created student profile for user in createPayment:', req.user.id);
      } catch (profileError) {
        console.error('Failed to create student profile in createPayment:', profileError);
        return res.status(500).json({ message: 'Failed to initialize student profile. Please try again.' });
      }
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