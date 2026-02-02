import { prisma } from "../utils/prisma-client.js";

// Build dashboard payload for students based on schema relationships
const buildStudentDashboard = async (userId, studentProfileId) => {
  const [enrollments, certificates, payments, quizAttempts, notes, reviews, notesCount, notifications, activities] = await Promise.all([
    prisma.enrollment.findMany({
      where: { student_id: studentProfileId },
      include: { course: true, progress: true },
      orderBy: { enrolled_at: "desc" },
    }),
    prisma.certificate.findMany({
      where: { student_id: studentProfileId },
      include: { course: true },
      orderBy: { issued_at: "desc" },
    }),
    prisma.payment.findMany({
      where: { student_id: studentProfileId },
      include: { course: true },
      orderBy: { paid_at: "desc" },
    }),
    prisma.quizAttempt.findMany({
      where: { student_id: studentProfileId },
      include: {
        quiz: {
          include: { lesson: { include: { course: true } } },
        },
      },
      orderBy: { id: "desc" },
    }),
    prisma.videoNote.findMany({
      where: { user_id: userId },
      include: { lesson: true },
      orderBy: { created_at: "desc" },
      take: 10,
    }),
    prisma.review.findMany({
      where: { student_id: studentProfileId },
      include: { course: true },
      orderBy: { created_at: "desc" },
      take: 10,
    }),
    prisma.videoNote.count({ where: { user_id: userId } }),
    prisma.notification.findMany({ where: { user_id: userId }, orderBy: { created_at: "desc" }, take: 8 }),
    prisma.activity.findMany({
      where: { user_id: userId },
      include: { course: true, lesson: true },
      orderBy: { created_at: "desc" },
      take: 8,
    }),
  ]);

  const completionBuckets = enrollments.reduce(
    (acc, e) => {
      acc[e.completion_status] = (acc[e.completion_status] || 0) + 1;
      return acc;
    },
    { ACTIVE: 0, COMPLETED: 0, DROPPED: 0 }
  );

  const progressChart = enrollments.map((enrollment) => {
    const completed = enrollment.progress.filter((p) => p.is_completed).length;
    const total = enrollment.progress.length || 1;
    return {
      courseId: enrollment.course_id,
      courseTitle: enrollment.course.title,
      percentage: Math.round((completed / total) * 100),
    };
  });

  return {
    role: "STUDENT",
    stats: {
      enrollmentsTotal: enrollments.length,
      active: completionBuckets.ACTIVE,
      completed: completionBuckets.COMPLETED,
      dropped: completionBuckets.DROPPED,
      certificates: certificates.length,
      payments: payments.length,
      quizAttempts: quizAttempts.length,
      notes: notesCount,
    },
    lists: {
      enrollments: enrollments.slice(0, 6).map((e) => ({
        id: e.id,
        courseTitle: e.course.title,
        status: e.completion_status,
        enrolled_at: e.enrolled_at,
      })),
      certificates: certificates.slice(0, 5).map((c) => ({
        id: c.id,
        courseTitle: c.course.title,
        issued_at: c.issued_at,
        verification_code: c.verification_code,
      })),
      payments: payments.slice(0, 5).map((p) => ({
        id: p.id,
        courseTitle: p.course.title,
        amount: p.amount,
        status: p.status,
        paid_at: p.paid_at,
      })),
      quizAttempts: quizAttempts.slice(0, 5).map((a) => ({
        id: a.id,
        quizTitle: a.quiz.title,
        courseTitle: a.quiz.lesson.course.title,
        score: a.score,
        passed: a.is_passed,
      })),
      notes: notes.map((n) => ({
        id: n.id,
        lessonTitle: n.lesson?.title || "Lesson",
        text: n.text,
        timestamp: n.timestamp_seconds,
        created_at: n.created_at,
      })),
      reviews: reviews.map((r) => ({
        id: r.id,
        courseTitle: r.course.title,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })),
      notifications,
      activities,
    },
    charts: {
      progress: progressChart,
    },
  };
};

// Build dashboard payload for instructors based on schema relationships
const buildInstructorDashboard = async (userId, instructorProfileId) => {
  const [courses, notifications, activities] = await Promise.all([
    prisma.course.findMany({
      where: { instructor_id: userId },
      include: { enrollments: true, payments: true, reviews: true, lessons: true },
      orderBy: { id: "desc" },
    }),
    prisma.notification.findMany({ where: { user_id: userId }, orderBy: { created_at: "desc" }, take: 8 }),
    prisma.activity.findMany({
      where: { user_id: userId },
      include: { course: true, lesson: true },
      orderBy: { created_at: "desc" },
      take: 8,
    }),
  ]);

  const totalStudents = new Set();
  let totalRevenue = 0;
  let published = 0;
  let drafts = 0;

  courses.forEach((course) => {
    if (course.is_published) published += 1;
    else drafts += 1;
    course.enrollments.forEach((en) => totalStudents.add(en.student_id));
    course.payments
      .filter((p) => p.status === "COMPLETED")
      .forEach((p) => {
        totalRevenue += Number(p.amount || 0);
      });
  });

  const courseSummaries = courses.map((course) => ({
    id: course.id,
    title: course.title,
    published: course.is_published,
    enrollments: course.enrollments.length,
    lessons: course.lessons.length,
    reviews: course.reviews.length,
    revenue: course.payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((acc, p) => acc + Number(p.amount || 0), 0),
  }));

  return {
    role: "INSTRUCTOR",
    stats: {
      courses: courses.length,
      published,
      drafts,
      students: totalStudents.size,
      revenue: totalRevenue,
      reviews: courses.reduce((acc, c) => acc + c.reviews.length, 0),
    },
    lists: {
      courses: courseSummaries.slice(0, 8),
      notifications,
      activities,
    },
    charts: {
      enrollments: courseSummaries.map((c) => ({ courseTitle: c.title, count: c.enrollments })),
      revenue: courseSummaries.map((c) => ({ courseTitle: c.title, amount: c.revenue })),
    },
  };
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        instructorProfile: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    let dashboard = { role: user.role };

    if (user.role === "STUDENT" && user.studentProfile) {
      dashboard = await buildStudentDashboard(userId, user.studentProfile.id);
    }

    if (user.role === "INSTRUCTOR" && user.instructorProfile && user.instructorProfile.id) {
      dashboard = await buildInstructorDashboard(userId, user.instructorProfile.id);
    } else if (user.role === "INSTRUCTOR") {
      // Handle case where instructor profile doesn't exist yet
      dashboard = {
        role: "INSTRUCTOR",
        stats: {
          courses: 0,
          published: 0,
          drafts: 0,
          students: 0,
          revenue: 0,
          reviews: 0,
        },
        lists: {
          courses: [],
          notifications: [],
          activities: [],
        },
        charts: {
          enrollments: [],
          revenue: [],
        },
      };
    }

    return res.json({ user, dashboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfileByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.user.findUnique({
      where: { id: String(id) },
      include: {
        studentProfile: true,
        instructorProfile: true
      }
    });

    if (!profile) return res.status(404).json({ message: 'Not found' });

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);
    const { first_name, last_name, bio, expertise, interests, profile_picture } = req.body;

    // update user table
    await prisma.user.update({
      where: { id: userId },
      data: { first_name, last_name, profile_picture, bio }
    });

    // Update based on role
    if (req.user.role === 'STUDENT') {
      await prisma.studentProfile.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          full_name: `${first_name} ${last_name}`,
          interests: interests ?? []
        },
        update: {
          full_name: `${first_name} ${last_name}`,
          interests: interests ?? []
        }
      });
    }

    if (req.user.role === 'INSTRUCTOR') {
      await prisma.instructorProfile.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          full_name: `${first_name} ${last_name}`,
          bio: bio ?? null,
          expertise_area: expertise ?? null
        },
        update: {
          full_name: `${first_name} ${last_name}`,
          bio: bio ?? null,
          expertise_area: expertise ?? null
        }
      });
    }

    res.json({ message: 'Profile updated' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
