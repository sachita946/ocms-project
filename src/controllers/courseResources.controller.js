import { prisma } from '../utils/prisma-client.js';
import fs from 'fs';
import path from 'path';

export const createCourseResource = async (req, res) => {
  try {
    const { course_id, type, title, content, zoom_link } = req.body;
    const userId = req.user.id;

    if (!course_id || !type || !title) {
      return res.status(400).json({
        message: 'Missing required fields: course_id, type, title'
      });
    }

    // Validate type
    const validTypes = ['notes', 'questions', 'preboard', 'board', 'zoom'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate zoom link if type is zoom
    if (type === 'zoom' && !zoom_link) {
      return res.status(400).json({
        message: 'Zoom link is required for zoom type resources'
      });
    }

    let file_url = null;
    let file_type = null;

    // Handle file upload for notes, preboard, and board types
    if ((type === 'notes' || type === 'preboard' || type === 'board') && req.files && req.files.file) {
      const file = req.files.file;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
        });
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          message: 'File size too large. Maximum size is 10MB.'
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), 'publicc', 'uploads', 'course-resources', uniqueFilename);

      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Move file to uploads directory
      await file.mv(uploadPath);
      
      file_url = `/uploads/course-resources/${uniqueFilename}`;
      file_type = file.mimetype;
    }

    // Create the resource
    const resourceData = {
      course_id: parseInt(course_id),
      type,
      title: title.trim(),
      file_url,
      file_type,
      zoom_link: zoom_link || null,
      user_id: userId
    };

    // Handle content based on type
    if (type === 'zoom') {
      // For zoom resources, content is optional
      resourceData.content = content ? content.trim() : '';
    } else {
      // For other types, content is required
      resourceData.content = content ? content.trim() : '';
    }

    const resource = await prisma.courseResource.create({
      data: resourceData
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('[courseResources.createCourseResource]', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Resource already exists' });
    }
    res.status(500).json({ message: 'Failed to create resource' });
  }
};

//get course resources
export const getCourseResources = async (req, res) => {
  try {
    const { courseId, type } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    const courseIdInt = parseInt(courseId);

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseIdInt }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // For published courses, check enrollment and payment (skip for instructors)
    if (course.is_published && req.user.role !== 'INSTRUCTOR') {
      // Get student profile
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { user_id: req.user.id }
      });

      if (!studentProfile) {
        return res.status(403).json({ message: 'Student profile not found. Please complete your profile.' });
      }

      // Check enrollment
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          student_id: studentProfile.id,
          course_id: courseIdInt
        }
      });

      if (!enrollment) {
        return res.status(403).json({ message: 'You must be enrolled in this course to access resources.' });
      }

      // Check payment for paid courses
      if (course.price && course.price > 0) {
        const payment = await prisma.payment.findFirst({
          where: {
            student_id: studentProfile.id,
            course_id: courseIdInt,
            status: 'COMPLETED'
          }
        });

        if (!payment) {
          return res.status(403).json({ message: 'Payment required to access this course.' });
        }
      }
    }

    const filter = { course_id: courseIdInt };
    if (type) filter.type = type;

    // Get resources
    const resources = await prisma.courseResource.findMany({
      where: filter,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(resources);
  } catch (error) {
    console.error('[courseResources.getCourseResources]', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Get public course resources (file-based only for notes, preboard, board)
export const getPublicCourseResources = async (req, res) => {
  try {
    const { courseId, type } = req.query;

    const filter = {
      file_url: { not: null }, // Only resources with files
      type: { in: ['notes', 'preboard', 'board'] } // Only these types
    };

    if (courseId) filter.course_id = parseInt(courseId);
    if (type && ['notes', 'preboard', 'board'].includes(type)) {
      filter.type = type;
    }

    // Get public resources
    const resources = await prisma.courseResource.findMany({
      where: filter,
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json(resources);
  } catch (error) {
    console.error('[courseResources.getPublicCourseResources]', error);
    res.status(500).json({ message: 'Failed to fetch public resources' });
  }
};

// Get a specific course resource by ID
export const getCourseResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.courseResource.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found'
      });
    }

    res.json(resource);
  } catch (error) {
    console.error('[courseResources.getCourseResourceById]', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
};

//Update a course resource
export const updateCourseResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const resource = await prisma.courseResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found'
      });
    }

    // Check if user is the owner
    if (resource.user_id !== userId) {
      return res.status(403).json({
        message: 'You do not have permission to update this resource'
      });
    }

    let file_url = resource.file_url;
    let file_type = resource.file_type;

    // Handle file upload for notes, preboard, and board types
    if ((resource.type === 'notes' || resource.type === 'preboard' || resource.type === 'board') && req.files && req.files.file) {
      const file = req.files.file;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
        });
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          message: 'File size too large. Maximum size is 10MB.'
        });
      }

      // Delete old file if exists
      if (resource.file_url) {
        const oldFilePath = path.join(process.cwd(), 'publicc', resource.file_url);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), 'publicc', 'uploads', 'course-resources', uniqueFilename);

      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Move file to uploads directory
      await file.mv(uploadPath);
      
      file_url = `/uploads/course-resources/${uniqueFilename}`;
      file_type = file.mimetype;
    }

    // Update the resource
    const updatedResource = await prisma.courseResource.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(content !== undefined && { content: content ? content.trim() : null }),
        file_url,
        file_type
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Resource updated successfully',
      resource: updatedResource
    });
  } catch (error) {
    console.error('[courseResources.updateCourseResource]', error);
    res.status(500).json({ message: 'Failed to update resource' });
  }
};

// Delete a course resource
export const deleteCourseResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await prisma.courseResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({
        message: 'Resource not found'
      });
    }

    if (resource.user_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'You do not have permission to delete this resource'
      });
    }

    // Delete associated file if exists
    if (resource.file_url) {
      const filePath = path.join(process.cwd(), 'publicc', resource.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete the resource
    await prisma.courseResource.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('[courseResources.deleteCourseResource]', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};
