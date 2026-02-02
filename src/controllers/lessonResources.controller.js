import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Create Lesson Resource
export const createLessonResource = async (req, res) => {
  try {
    const { lesson_id, type, title, content, zoom_link } = req.body;
    const user_id = req.user.id;

    if (!lesson_id || !type || !title) {
      return res.status(400).json({ message: 'Missing required fields: lesson_id, type, title' });
    }

    // Validate type
    const validTypes = ['notes', 'questions', 'preboard', 'zoom'];
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

    // Handle file upload for notes, questions, and preboard types
    if ((type === 'notes' || type === 'questions' || type === 'preboard') && req.files && req.files.file) {
      const file = req.files.file;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.'
        });
      }

      // Check file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        return res.status(400).json({
          message: 'File size too large. Maximum size is 500MB.'
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const uploadPath = path.join(process.cwd(), 'publicc', 'uploads', 'lesson-resources', uniqueFilename);

      // Ensure directory exists
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Move file to uploads directory
      await file.mv(uploadPath);

      file_url = `/uploads/lesson-resources/${uniqueFilename}`;
      file_type = file.mimetype;
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lesson_id) }
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Create resource
    const resourceData = {
      lesson_id: parseInt(lesson_id),
      type,
      title: title.trim(),
      file_url,
      file_type,
      zoom_link: zoom_link || null,
      user_id
    };

    // Handle content based on type
    if (type === 'zoom') {
      // For zoom resources, content is optional
      resourceData.content = content ? content.trim() : '';
    } else {
      // For other types, content is required unless file is provided
      resourceData.content = content ? content.trim() : '';
    }

    const resource = await prisma.lessonResource.create({
      data: resourceData
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Error creating lesson resource:', error);
    res.status(500).json({ message: 'Failed to create resource' });
  }
};

// Get Lesson Resources
export const getLessonResources = async (req, res) => {
  try {
    const { lesson_id, type } = req.query;
    const where = {};
    if (lesson_id) where.lesson_id = parseInt(lesson_id);
    if (type) where.type = type;

    const resources = await prisma.lessonResource.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({
      message: 'Resources retrieved successfully',
      resources,
      count: resources.length
    });
  } catch (error) {
    console.error('Error fetching lesson resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Get Single Lesson Resource
export const getLessonResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.lessonResource.findUnique({
      where: { id: parseInt(id) },
      include: {
        lesson: true,
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.status(200).json({
      message: 'Resource retrieved successfully',
      resource
    });
  } catch (error) {
    console.error('Error fetching lesson resource:', error);
    res.status(500).json({ message: 'Failed to fetch resource' });
  }
};

// Update Lesson Resource
export const updateLessonResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, content } = req.body;
    const user_id = req.user.id;
    const resource = await prisma.lessonResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (resource.user_id !== user_id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update resource
    const updated = await prisma.lessonResource.update({
      where: { id: parseInt(id) },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(content && { content })
      }
    });

    res.status(200).json({
      message: 'Resource updated successfully',
      resource: updated
    });
  } catch (error) {
    console.error('Error updating lesson resource:', error);
    res.status(500).json({ message: 'Failed to update resource' });
  }
};

// Delete Lesson Resource
export const deleteLessonResource = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const resource = await prisma.lessonResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    if (resource.user_id !== user_id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete resource
    await prisma.lessonResource.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson resource:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};
