import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { prisma } from '../utils/prisma-client.js';

const router = Router();

// Zoom access route - handles authentication and payment checks
router.get('/join/:courseId', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    if (!courseId || isNaN(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    // Check if course exists and is advanced
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        level: true,
        zoom_link: true,
        price: true,
        is_published: true
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.is_published) {
      return res.status(404).json({ message: 'Course not available' });
    }

    if (course.level !== 'ADVANCED') {
      // For non-advanced courses, redirect directly to Zoom if link exists
      if (course.zoom_link) {
        return res.redirect(course.zoom_link);
      }
      return res.status(404).json({ message: 'Zoom link not available' });
    }

    // For advanced courses, check authentication
    if (!req.user) {
      // Not authenticated - redirect to login with return URL
      const returnUrl = `/api/zoom/join/${courseId}`;
      return res.redirect(`/auth/login.html?returnUrl=${encodeURIComponent(returnUrl)}`);
    }

    // Check if user is enrolled and has paid
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: req.user.id,
        course_id: courseId
      },
      include: {
        course: {
          select: {
            price: true
          }
        }
      }
    });

    if (!enrollment) {
      // Not enrolled - redirect to course page or enrollment
      return res.redirect(`/student/course-details.html?courseId=${courseId}&message=${encodeURIComponent('Please enroll in this course first')}`);
    }

    // Check if payment is required and completed
    if (course.price > 0) {
      const payment = await prisma.payment.findFirst({
        where: {
          student_id: req.user.id,
          course_id: courseId,
          status: 'COMPLETED'
        }
      });

      if (!payment) {
        // Payment required but not completed - redirect to payment with return URL
        const returnUrl = `/api/zoom/join/${courseId}`;
        return res.redirect(`/student/payment.html?courseId=${courseId}&courseName=${encodeURIComponent(course.title)}&price=${course.price}&returnUrl=${encodeURIComponent(returnUrl)}&message=${encodeURIComponent('Please complete payment to access this course')}`);
      }
    }

    // All checks passed - redirect to Zoom
    if (course.zoom_link) {
      return res.redirect(course.zoom_link);
    } else {
      return res.status(404).json({ message: 'Zoom link not available for this course' });
    }

  } catch (error) {
    console.error('Zoom join error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Optional: Direct Zoom access for authenticated users (for API calls)
router.get('/access/:courseId', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        zoom_link: true,
        level: true,
        is_published: true
      }
    });

    if (!course || !course.is_published || !course.zoom_link) {
      return res.status(404).json({ message: 'Zoom link not available' });
    }

    // For advanced courses, check enrollment and payment
    if (course.level === 'ADVANCED') {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          student_id: req.user.id,
          course_id: courseId
        }
      });

      if (!enrollment) {
        return res.status(403).json({ message: 'Enrollment required' });
      }

      // Check payment for paid courses
      const payment = await prisma.payment.findFirst({
        where: {
          student_id: req.user.id,
          course_id: courseId,
          status: 'COMPLETED'
        }
      });

      if (!payment && course.price > 0) {
        return res.status(403).json({ message: 'Payment required' });
      }
    }

    res.json({ zoom_link: course.zoom_link });

  } catch (error) {
    console.error('Zoom access error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;