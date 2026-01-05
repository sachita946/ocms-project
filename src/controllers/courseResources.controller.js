import { prisma } from '../utils/prisma-client.js';

export const createCourseResource = async (req, res) => {
  try {
    const { course_id, type, title, content, zoom_link } = req.body;
    const userId = req.user.id;
    if (!course_id || !type || !title || !content) {
      return res.status(400).json({
        message: 'Missing required fields: course_id, type, title, content'
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

    // Create the resource
    const resource = await prisma.courseResource.create({
      data: {
        course_id: parseInt(course_id),
        type,
        title: title.trim(),
        content: content.trim(),
        zoom_link: zoom_link || null,
        user_id: userId
      }
    });

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Error creating course resource:', error);
    res.status(500).json({
      message: 'Failed to create resource',
      error: error.message
    });
  }
};

//get course resources
export const getCourseResources = async (req, res) => {
  try {
    const { courseId, type } = req.query;

    const filter = {};
    if (courseId) filter.course_id = parseInt(courseId);
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
    console.error('Error fetching course resources:', error);
    res.status(500).json({
      message: 'Failed to fetch resources',
      error: error.message
    });
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
    console.error('Error fetching course resource:', error);
    res.status(500).json({
      message: 'Failed to fetch resource',
      error: error.message
    });
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

    // Update the resource
    const updatedResource = await prisma.courseResource.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title: title.trim() }),
        ...(content && { content: content.trim() })
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
    console.error('Error updating course resource:', error);
    res.status(500).json({
      message: 'Failed to update resource',
      error: error.message
    });
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

    // Delete the resource
    await prisma.courseResource.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course resource:', error);
    res.status(500).json({
      message: 'Failed to delete resource',
      error: error.message
    });
  }
};
