import {prisma} from '../utils/prisma-client.js';

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
    if (!p.lesson_id || !p.title || !p.file_url || !p.file_type) {
      return res.status(400).json({ message: 'lesson_id, title, file_url, and file_type are required' });
    }
    const resource = await prisma.resource.create({
      data: {
        lesson_id: Number(p.lesson_id),
        title: p.title,
        file_url: p.file_url,
        file_type: p.file_type
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
        file_url: payload.file_url ?? existing.file_url,
        file_type: payload.file_type ?? existing.file_type
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