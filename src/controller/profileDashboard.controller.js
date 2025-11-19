import prisma from '../utils/prisma-client.js';


/* ---------------- STUDENT ---------------- */
export const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.studentProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: true,
        enrollments: { include: { course: true } },
        certificates: { include: { course: true } },
        payments: { include: { course: true } },
        quiz_attempts: { include: { quiz: true } },
        reviews: { include: { course: true } },
      },
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('getStudentProfile', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, profile_picture, bio, current_education_level, interests, is_active } = req.body;
    const updatedProfile = await prisma.studentProfile.update({
      where: { user_id: userId },
      data: { full_name, phone, profile_picture, bio, current_education_level, interests, is_active },
    });
    res.json(updatedProfile);
  } catch (err) {
    console.error('updateStudentProfile', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: userId },
      include: { course: true, progress: { include: { lesson: true } } }
    });

    const progressData = enrollments.map(e => {
      const totalLessons = e.progress.length;
      const completedLessons = e.progress.filter(p => p.is_completed).length;
      return {
        courseTitle: e.course.title,
        totalLessons,
        completedLessons,
        percentage: totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
      };
    });

    res.json({ enrollments, progressData });
  } catch (err) {
    console.error('getStudentDashboard', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/* ---------------- INSTRUCTOR ---------------- */
export const getInstructorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.instructorProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: true,
        user: { include: { courses_created: { include: { enrollments: true, reviews: true, payments: true } } } },
      },
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('getInstructorProfile', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateInstructorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, profile_picture, bio, expertise_area, website, is_verified } = req.body;
    const updatedProfile = await prisma.instructorProfile.update({
      where: { user_id: userId },
      data: { full_name, phone, profile_picture, bio, expertise_area, website, is_verified },
    });
    res.json(updatedProfile);
  } catch (err) {
    console.error('updateInstructorProfile', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getInstructorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await prisma.course.findMany({
      where: { instructor_id: userId },
      include: {
        enrollments: true,
        payments: true,
        reviews: true,
      },
    });

    const stats = courses.map(c => ({
      courseTitle: c.title,
      enrolled: c.enrollments.length,
      revenue: c.payments.reduce((acc, p) => acc + p.amount, 0),
      reviews: c.reviews.length,
    }));

    res.json({ courses, stats });
  } catch (err) {
    console.error('getInstructorDashboard', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
