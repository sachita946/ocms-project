import {prisma} from '../utils/prisma-client.js';

// Get all lessons
export const getAllLessons = async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      include: { course: true, resources: true }
    });
    res.json(lessons);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create lesson
export const createLesson = async (req, res) => {
  try {
    const { course_id, title, content_type, content_url, duration } = req.body;
    if(!course_id || !title || !content_type) return res.status(400).json({ message: "Required fields missing" });

    const lesson = await prisma.lesson.create({
      data: { course_id, title, content_type, content_url, duration }
    });
    res.status(201).json(lesson);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Read all lessons by course
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await prisma.lesson.findMany({ where: { course_id: parseInt(courseId) } });
    res.json(lessons);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Read single lesson
export const getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id: parseInt(id) } });
    if(!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update lesson
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const lesson = await prisma.lesson.update({ where: { id: parseInt(id) }, data });
    res.json(lesson);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Lesson deleted" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
