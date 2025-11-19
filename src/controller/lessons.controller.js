import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllLessons = async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany();
    return res.json(lessons);
  } catch (err) {
    console.error('getAllLessons', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    return res.json(lesson);
  } catch (err) {
    console.error('getLesson', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createLesson = async (req, res) => {
  try {
    const payload = req.body;
    // only instructors or admin can create lessons
    const lesson = await prisma.lesson.create({
      data: {
        title: payload.title,
        content_type: payload.content_type,
        content_url: payload.content_url ?? null,
        duration_minutes: payload.duration_minutes ?? null,
        course_id: payload.course_id ?? null
      }
    });
    return res.status(201).json(lesson);
  } catch (err) {
    console.error('createLesson', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Lesson not found' });
    const updated = await prisma.lesson.update({
      where: { id },
      data: {
        title: payload.title ?? existing.title,
        content_type: payload.content_type ?? existing.content_type,
        content_url: payload.content_url ?? existing.content_url,
        duration_minutes: payload.duration_minutes ?? existing.duration_minutes
      }
    });
    return res.json(updated);
  } catch (err) {
    console.error('updateLesson', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Lesson not found' });
    await prisma.lesson.delete({ where: { id } });
    return res.json({ message: 'Lesson deleted' });
  } catch (err) {
    console.error('deleteLesson', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};