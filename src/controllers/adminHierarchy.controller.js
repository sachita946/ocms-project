import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get curriculum by program (e.g., BIM, CSIT, BCA)
export const getCurriculumByProgram = async (req, res) => {
  try {
    const { program } = req.query;

    if (!program) {
      return res.status(400).json({ message: 'Program name is required' });
    }

    // Get all semesters with their subjects for the specified program
    const semesters = await prisma.semester.findMany({
      orderBy: { semester_num: 'asc' },
      include: {
        subjects: {
          where: { program },
          orderBy: { title: 'asc' }
        }
      }
    });

    // Filter out semesters that have no subjects for this program
    const curriculum = semesters.filter(semester => semester.subjects.length > 0);

    res.status(200).json({
      message: `Curriculum for ${program} retrieved successfully`,
      program,
      semesters: curriculum,
      count: curriculum.length
    });
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    res.status(500).json({ message: 'Failed to fetch curriculum' });
  }
};

// Get all programs available
export const getAllPrograms = async (req, res) => {
  try {
    // Get distinct programs from subjects
    const programs = await prisma.subject.findMany({
      select: {
        program: true
      },
      distinct: ['program'],
      orderBy: {
        program: 'asc'
      }
    });

    const programList = programs.map(p => p.program);

    res.status(200).json({
      message: 'Programs retrieved successfully',
      programs: programList,
      count: programList.length
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Failed to fetch programs' });
  }
};

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
    const { semester_id, program } = req.query;

    if (!semester_id) {
      return res.status(400).json({ message: 'Semester ID is required' });
    }

    const where = { semester_id: parseInt(semester_id) };
    if (program) {
      where.program = program;
    }

    const subjects = await prisma.subject.findMany({
      where,
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
    const { semester_id, program, title, description } = req.body;

    if (!semester_id || !program || !title) {
      return res.status(400).json({ message: 'Semester ID, program, and title are required' });
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
        program,
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

// Delete subject (admin only)
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await prisma.subject.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ message: 'Failed to delete subject' });
  }
};

// Get subject resources (admin, instructor, student)
export const getSubjectResources = async (req, res) => {
  try {
    const { subject_id, type } = req.query;

    if (!subject_id) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    const where = { subject_id: parseInt(subject_id) };
    if (type) {
      where.type = type;
    }

    // Get subject info
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subject_id) },
      include: {
        semester: true
      }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Get resources from CourseResource linked to this subject
    const resources = await prisma.courseResource.findMany({
      where: {
        subject_id: parseInt(subject_id),
        type: type || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      message: 'Resources retrieved successfully',
      subject,
      resources,
      count: resources.length
    });
  } catch (error) {
    console.error('Error fetching subject resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Create subject resource (admin, instructor)
export const createSubjectResource = async (req, res) => {
  try {
    const { subject_id, type, title, content } = req.body;
    const user_id = req.user.id;

    if (!subject_id || !type || !title) {
      return res.status(400).json({ message: 'Missing required fields: subject_id, type, title' });
    }

    // Validate type
    const validTypes = ['notes', 'preboard', 'board'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subject_id) }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check permissions: Admin can upload for any subject, Instructor only for their subjects
    if (req.user.role === 'INSTRUCTOR') {
      // For now, allow all instructors to upload
      // TODO: Add subject-instructor relationship check
    }

    let file_url = null;
    let file_type = null;

    // Handle file upload
    if (req.files && req.files.file) {
      const file = req.files.file;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
        });
      }

      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          message: 'File size too large. Maximum size is 10MB.'
        });
      }

      const path = await import('path');
      const fs = await import('fs');
      
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), 'publicc', 'uploads', 'subject-resources', uniqueFilename);

      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      await file.mv(uploadPath);
      file_url = `/uploads/subject-resources/${uniqueFilename}`;
      file_type = file.mimetype;
    }

    // Create resource linked to subject instead of course
    const resource = await prisma.courseResource.create({
      data: {
        subject_id: parseInt(subject_id),
        type,
        title: title.trim(),
        content: content ? content.trim() : '',
        file_url,
        file_type,
        user_id
      }
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Error creating subject resource:', error);
    res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};

// Delete subject resource (admin, or instructor who created it)
export const deleteSubjectResource = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const resource = await prisma.courseResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check permissions
    if (req.user.role !== 'ADMIN' && resource.user_id !== user_id) {
      return res.status(403).json({ message: 'Unauthorized to delete this resource' });
    }

    await prisma.courseResource.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject resource:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};
