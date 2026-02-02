import {prisma} from '../utils/prisma-client.js';

// Create
export const createCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      level, 
      price, 
      thumbnail_url, 
      promo_video_url, 
      is_published, 
      requirements, 
      learning_outcomes, 
      duration_weeks, 
      language, 
      discount_price,
      zoom_link 
    } = req.body;
    if (!title || !description || !category || !level || price == null)
      return res.status(400).json({ message: "All required fields must be filled" });

    // Ensure advanced courses require payment
    if (level === 'ADVANCED' && (price == null || price <= 0)) {
      return res.status(400).json({ message: "Advanced courses must have a valid price greater than 0" });
    }

    // Check if instructor is verified
    // const instructorProfile = await prisma.instructorProfile.findUnique({
    //   where: { user_id: parseInt(req.user.id) }
    // });

    // if (!instructorProfile || !instructorProfile.is_verified) {
    //   return res.status(403).json({ message: "Only verified instructors can create courses" });
    // }

    // Handle video URLs - if thumbnail_url is a YouTube link, use it as promo_video_url
    let finalPromoVideoUrl = promo_video_url;
    let finalThumbnailUrl = thumbnail_url;
    
    if (thumbnail_url && (thumbnail_url.includes('youtu.be') || thumbnail_url.includes('youtube.com'))) {
      finalPromoVideoUrl = thumbnail_url;
      finalThumbnailUrl = null; // Clear thumbnail if it's actually a video
    }

    // Check instructor verification for Zoom links
    let finalZoomLink = null;
    if (zoom_link) {
      try {
        const instructorProfile = await prisma.instructorProfile.findUnique({
          where: { user_id: parseInt(req.user.id) }
        });
        if (instructorProfile && instructorProfile.is_verified) {
          finalZoomLink = zoom_link;
        } else {
          return res.status(403).json({ message: "Only verified instructors can add Zoom links" });
        }
      } catch (error) {
        console.error('Error checking instructor profile:', error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    let instructorId = null;
    if (req.user && req.user.id) {
      instructorId = parseInt(req.user.id);
    } else {
      // For testing, assign to admin or a default user
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      instructorId = admin ? admin.id : 1;
    }

    const course = await prisma.course.create({
      data: { 
        title, 
        description, 
        category, 
        level, 
        price, 
        thumbnail_url: finalThumbnailUrl, 
        promo_video_url: finalPromoVideoUrl, 
        is_published: is_published !== undefined ? is_published : true, 
        requirements: requirements || [], 
        learning_outcomes: learning_outcomes || [], 
        duration_weeks, 
        language: language || "English", 
        discount_price,
        zoom_link: finalZoomLink, 
        instructor_id: instructorId
      }
    });
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Read all
export const getAllCourses = async (req, res) => {
  try {
    const { level, category, instructor_id, is_published } = req.query;

    // Build where clause for filtering
    const where = {};
    if (level) where.level = level;
    if (category) where.category = category;
    if (instructor_id) where.instructor_id = parseInt(instructor_id);
    if (is_published !== undefined) where.is_published = is_published === 'true';

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { first_name: true, last_name: true, email: true } },
        lessons: {
          include: {
            resources: true
          }
        },
        _count: { select: { enrollments: true, lessons: true } }
      }
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get instructor courses
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructor_id: parseInt(req.user.id) },
      include: {
        lessons: true,
        enrollments: { select: { id: true } },
        payments: { select: { amount: true } }
      }
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Read single
export const getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ 
      where: { id: parseInt(id) },
      include: {
        instructor: { select: { first_name: true, last_name: true, email: true } },
        lessons: true,
        enrollments: true
      }
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update
export const updateCourse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (
      course.instructor_id !== parseInt(req.user.id) &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: req.body
    });

    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete
export const deleteCourse = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (
      course.instructor_id !== parseInt(req.user.id) &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
