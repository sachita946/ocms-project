import prisma from '../utils/prisma-client.js';

export const markLessonComplete = async (req, res) => {
  try {
    const studentProfileId = req.studentProfileId;
    if (!studentProfileId) return res.status(400).json({ message: 'Student profile not found' });

    const { enrollment_id, lesson_id } = req.body;
    if (!enrollment_id || !lesson_id) return res.status(400).json({ message: 'enrollment_id and lesson_id required' });

    // create progress entry (unique compound prevents duplicates)
    const p = await prisma.progress.create({ data: { enrollment_id, lesson_id, is_completed: true, completed_at: new Date() } });
    return res.status(201).json(p);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Already marked completed' });
    console.error('markLessonComplete', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProgressByEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const prog = await prisma.progress.findMany({ where: { enrollment_id: parseInt(enrollmentId) }, include: { lesson: true } });
    return res.json(prog);
  } catch (err) {
    console.error('getProgressByEnrollment', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};