import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create Lesson Resource
export const createLessonResource = async (req, res) => {
  try {
    const { lesson_id, type, title, content, zoom_link } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!lesson_id || !type || !title || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate type
    if (!['notes', 'questions', 'preboard', 'zoom'].includes(type)) {
      return res.status(400).json({ message: 'Invalid resource type' });
    }

    // Validate zoom link if type is zoom
    if (type === 'zoom' && !zoom_link) {
      return res.status(400).json({
        message: 'Zoom link is required for zoom type resources'
      });
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lesson_id }
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Create resource
    const resource = await prisma.lessonResource.create({
      data: {
        lesson_id,
        type,
        title,
        content,
        zoom_link: zoom_link || null,
        user_id
      }
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

    // Build filter
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

    // Check if resource exists
    const resource = await prisma.lessonResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is the owner or admin
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

    // Check if resource exists
    const resource = await prisma.lessonResource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check if user is the owner or admin
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
