import prisma from '../utils/prisma-client.js';

export const getAllResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany();
    res.json(resources);
  } catch (err) {
    console.error('getAllResources', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    console.error('getResource', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createResource = async (req, res) => {
  try {
    const p = req.body;
    const resource = await prisma.resource.create({
      data: {
        title: p.title,
        url: p.url,
        content_type: p.content_type,
        lesson_id: p.lesson_id ?? null,
        course_id: p.course_id ?? null
      }
    });
    res.status(201).json(resource);
  } catch (err) {
    console.error('createResource', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Resource not found' });
    const updated = await prisma.resource.update({
      where: { id },
      data: {
        title: payload.title ?? existing.title,
        url: payload.url ?? existing.url,
        content_type: payload.content_type ?? existing.content_type
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('updateResource', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.resource.delete({ where: { id } });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    console.error('deleteResource', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};