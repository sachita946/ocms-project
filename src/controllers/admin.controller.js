import { prisma } from '../utils/prisma-client.js';

// Admin stats dashboard
export const getStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const totalUsers = await prisma.user.count();
    const totalCourses = await prisma.course.count();
    const totalEnrollments = await prisma.enrollment.count();
    const totalPayments = await prisma.payment.count();
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('getStats', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users for admin
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        is_active: true,
        created_at: true,
        studentProfile: {
          select: { id: true, full_name: true }
        },
        instructorProfile: {
          select: { id: true, full_name: true, is_verified: true, is_pending_approval: true, qualifications: true, experience_years: true }
        }
      },
      take: 100
    });

    res.json(users);
  } catch (err) {
    console.error('getAllUsers', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all courses for admin
export const getAllCourses = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: { id: true, first_name: true, last_name: true, email: true }
        },
        _count: {
          select: { enrollments: true, lessons: true }
        }
      },
      take: 100
    });

    res.json(courses);
  } catch (err) {
    console.error('getAllCourses', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all payments for admin
export const getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const payments = await prisma.payment.findMany({
      include: {
        student: {
          select: { user: { select: { first_name: true, last_name: true, email: true } } }
        },
        course: {
          select: { title: true }
        }
      },
      orderBy: { paid_at: 'desc' },
      take: 100
    });

    res.json(payments);
  } catch (err) {
    console.error('getAllPayments', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all reviews for admin
export const getAllReviews = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const reviews = await prisma.review.findMany({
      include: {
        student: {
          select: { user: { select: { first_name: true, last_name: true, email: true } } }
        },
        course: {
          select: { title: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    res.json(reviews);
  } catch (err) {
    console.error('getAllReviews', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all notifications for admin
export const getAllNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    res.json(notifications);
  } catch (err) {
    console.error('getAllNotifications', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all activities for admin
export const getAllActivities = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const activities = await prisma.activity.findMany({
      include: {
        user: {
          select: { first_name: true, last_name: true, email: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    res.json(activities);
  } catch (err) {
    console.error('getAllActivities', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve instructor
export const approveInstructor = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { userId } = req.params;

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!instructorProfile) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }

    if (!instructorProfile.is_pending_approval) {
      return res.status(400).json({ message: 'Instructor is not pending approval' });
    }

    // Check qualifications and experience
    const hasQualifications = instructorProfile.qualifications && instructorProfile.qualifications.length > 0;
    const hasExperience = instructorProfile.experience_years && instructorProfile.experience_years >= 1;

    if (!hasQualifications || !hasExperience) {
      return res.status(400).json({ message: 'Instructor does not meet minimum qualifications (education and 1+ years experience required)' });
    }

    await prisma.instructorProfile.update({
      where: { user_id: userId },
      data: {
        is_verified: true,
        is_pending_approval: false
      }
    });

    res.json({ message: 'Instructor approved successfully' });
  } catch (err) {
    console.error('approveInstructor', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reject instructor
export const rejectInstructor = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { userId } = req.params;

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { user_id: userId }
    });

    if (!instructorProfile) {
      return res.status(404).json({ message: 'Instructor profile not found' });
    }

    if (!instructorProfile.is_pending_approval) {
      return res.status(400).json({ message: 'Instructor is not pending approval' });
    }

    // Mark as rejected (set pending to false, verified remains false)
    await prisma.instructorProfile.update({
      where: { user_id: userId },
      data: {
        is_pending_approval: false,
        is_verified: false
      }
    });

    res.json({ message: 'Instructor rejected successfully' });
  } catch (err) {
    console.error('rejectInstructor', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
