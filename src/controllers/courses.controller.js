import {prisma} from '../utils/prisma-client.js';

// Create
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, level, price, thumbnail_url } = req.body;
    if (!title || !description || !category || !level || price == null)
      return res.status(400).json({ message: "All required fields must be filled" });

    // Check if instructor is verified
    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!instructorProfile || !instructorProfile.is_verified) {
      return res.status(403).json({ message: "Only verified instructors can create courses" });
    }

    const course = await prisma.course.create({
      data: { title, description, category, level, price, thumbnail_url, instructor_id: req.user.id }
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
    const courses = await prisma.course.findMany({
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
      where: { instructor_id: req.user.id },
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
    const { id } = req.params;
    const data = req.body;
    const course = await prisma.course.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
