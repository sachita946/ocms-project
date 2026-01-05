import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all semesters
export const getSemesters = async (req, res) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { semester_num: 'asc' },
      include: {
        subjects: {
          orderBy: { title: 'asc' }
        }
      }
    });

    res.status(200).json({
      message: 'Semesters retrieved successfully',
      semesters,
      count: semesters.length
    });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ message: 'Failed to fetch semesters' });
  }
};

// Get subjects by semester
export const getSubjectsBySemester = async (req, res) => {
  try {
    const { semester_id } = req.query;

    if (!semester_id) {
      return res.status(400).json({ message: 'Semester ID is required' });
    }

    const subjects = await prisma.subject.findMany({
      where: { semester_id: parseInt(semester_id) },
      orderBy: { title: 'asc' },
      include: {
        lessons: {
          orderBy: { title: 'asc' }
        }
      }
    });

    res.status(200).json({
      message: 'Subjects retrieved successfully',
      subjects,
      count: subjects.length
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

// Get lessons by subject
export const getLessonsBySubject = async (req, res) => {
  try {
    const { subject_id } = req.query;

    if (!subject_id) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    const lessons = await prisma.lesson.findMany({
      where: { subject_id: parseInt(subject_id) },
      orderBy: { title: 'asc' }
    });

    res.status(200).json({
      message: 'Lessons retrieved successfully',
      lessons,
      count: lessons.length
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
};

// Create semester (admin only)
export const createSemester = async (req, res) => {
  try {
    const { semester_num, name, description } = req.body;

    if (!semester_num || !name) {
      return res.status(400).json({ message: 'Semester number and name are required' });
    }

    // Check if semester already exists
    const existing = await prisma.semester.findUnique({
      where: { semester_num }
    });

    if (existing) {
      return res.status(400).json({ message: 'Semester already exists' });
    }

    const semester = await prisma.semester.create({
      data: {
        semester_num,
        name,
        description
      }
    });

    res.status(201).json({
      message: 'Semester created successfully',
      semester
    });
  } catch (error) {
    console.error('Error creating semester:', error);
    res.status(500).json({ message: 'Failed to create semester' });
  }
};

// Create subject (admin only)
export const createSubject = async (req, res) => {
  try {
    const { semester_id, title, description } = req.body;

    if (!semester_id || !title) {
      return res.status(400).json({ message: 'Semester ID and title are required' });
    }

    // Check if semester exists
    const semester = await prisma.semester.findUnique({
      where: { id: parseInt(semester_id) }
    });

    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    const subject = await prisma.subject.create({
      data: {
        semester_id: parseInt(semester_id),
        title,
        description
      }
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ message: 'Failed to create subject' });
  }
};

// Create lesson (admin only)
export const createLesson = async (req, res) => {
  try {
    const { subject_id, course_id, title, content_type, content_url, duration } = req.body;

    if (!subject_id || !course_id || !title || !content_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subject_id) }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        course_id: parseInt(course_id),
        subject_id: parseInt(subject_id),
        title,
        content_type,
        content_url,
        duration: duration ? parseInt(duration) : null
      }
    });

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Failed to create lesson' });
  }
};
