import { prisma } from '../utils/prisma-client.js';

// Get instructor earnings
export const getInstructorEarnings = async (req, res) => {
  try {
    const instructorId = req.instructorProfileId;
    if (!instructorId) return res.status(400).json({ message: 'Instructor profile not found' });

    const earnings = await prisma.instructorEarning.findMany({
      where: { instructor_id: instructorId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            transaction_id: true,
            paid_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.net_amount, 0);
    const pendingEarnings = earnings
      .filter(earning => earning.status === 'PENDING')
      .reduce((sum, earning) => sum + earning.net_amount, 0);
    const paidEarnings = earnings
      .filter(earning => earning.status === 'PAID')
      .reduce((sum, earning) => sum + earning.net_amount, 0);

    const formattedEarnings = earnings.map(earning => ({
      ...earning,
      amount: parseFloat(earning.amount),
      net_amount: parseFloat(earning.net_amount),
      platform_fee: parseFloat(earning.platform_fee),
      formatted_amount: `NPR ${parseFloat(earning.amount).toLocaleString()}`,
      formatted_net_amount: `NPR ${parseFloat(earning.net_amount).toLocaleString()}`,
      formatted_platform_fee: `NPR ${parseFloat(earning.platform_fee * earning.amount).toLocaleString()}`
    }));

    res.json({
      earnings: formattedEarnings,
      summary: {
        total_earnings: parseFloat(totalEarnings.toFixed(2)),
        pending_earnings: parseFloat(pendingEarnings.toFixed(2)),
        paid_earnings: parseFloat(paidEarnings.toFixed(2)),
        total_payments: earnings.length,
        formatted_total_earnings: `NPR ${totalEarnings.toLocaleString()}`,
        formatted_pending_earnings: `NPR ${pendingEarnings.toLocaleString()}`,
        formatted_paid_earnings: `NPR ${paidEarnings.toLocaleString()}`
      },
      currency: 'NPR'
    });
  } catch (err) {
    console.error('getInstructorEarnings error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get earnings by course
export const getEarningsByCourse = async (req, res) => {
  try {
    const instructorId = req.instructorProfileId;
    if (!instructorId) return res.status(400).json({ message: 'Instructor profile not found' });

    const earnings = await prisma.instructorEarning.findMany({
      where: { instructor_id: instructorId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            level: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Group by course
    const courseEarnings = {};
    earnings.forEach(earning => {
      const courseId = earning.course_id;
      if (!courseEarnings[courseId]) {
        courseEarnings[courseId] = {
          course: earning.course,
          total_earnings: 0,
          total_payments: 0,
          earnings: []
        };
      }
      courseEarnings[courseId].total_earnings += earning.net_amount;
      courseEarnings[courseId].total_payments += 1;
      courseEarnings[courseId].earnings.push({
        ...earning,
        amount: parseFloat(earning.amount),
        net_amount: parseFloat(earning.net_amount)
      });
    });

    const result = Object.values(courseEarnings).map(courseData => ({
      ...courseData,
      total_earnings: parseFloat(courseData.total_earnings.toFixed(2)),
      formatted_total_earnings: `NPR ${courseData.total_earnings.toLocaleString()}`
    }));

    res.json({
      course_earnings: result,
      currency: 'NPR'
    });
  } catch (err) {
    console.error('getEarningsByCourse error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Get all instructor earnings
export const getAllInstructorEarnings = async (req, res) => {
  try {
    const earnings = await prisma.instructorEarning.findMany({
      include: {
        instructor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            transaction_id: true,
            paid_at: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.net_amount, 0);
    const pendingEarnings = earnings
      .filter(earning => earning.status === 'PENDING')
      .reduce((sum, earning) => sum + earning.net_amount, 0);

    const formattedEarnings = earnings.map(earning => ({
      ...earning,
      amount: parseFloat(earning.amount),
      net_amount: parseFloat(earning.net_amount),
      platform_fee: parseFloat(earning.platform_fee),
      instructor_name: `${earning.instructor.user.first_name} ${earning.instructor.user.last_name}`,
      instructor_email: earning.instructor.user.email,
      formatted_amount: `NPR ${parseFloat(earning.amount).toLocaleString()}`,
      formatted_net_amount: `NPR ${parseFloat(earning.net_amount).toLocaleString()}`,
      formatted_platform_fee: `NPR ${parseFloat(earning.platform_fee * earning.amount).toLocaleString()}`
    }));

    res.json({
      earnings: formattedEarnings,
      summary: {
        total_earnings: parseFloat(totalEarnings.toFixed(2)),
        pending_earnings: parseFloat(pendingEarnings.toFixed(2)),
        total_payments: earnings.length,
        formatted_total_earnings: `NPR ${totalEarnings.toLocaleString()}`,
        formatted_pending_earnings: `NPR ${pendingEarnings.toLocaleString()}`
      },
      currency: 'NPR'
    });
  } catch (err) {
    console.error('getAllInstructorEarnings error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin: Update earning status
export const updateEarningStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const earning = await prisma.instructorEarning.findUnique({
      where: { id }
    });

    if (!earning) {
      return res.status(404).json({ message: 'Earning not found' });
    }

    const updated = await prisma.instructorEarning.update({
      where: { id },
      data: { status },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    });

    res.json({
      message: 'Earning status updated successfully',
      earning: {
        ...updated,
        amount: parseFloat(updated.amount),
        net_amount: parseFloat(updated.net_amount),
        instructor_name: `${updated.instructor.user.first_name} ${updated.instructor.user.last_name}`
      }
    });
  } catch (err) {
    console.error('updateEarningStatus error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};