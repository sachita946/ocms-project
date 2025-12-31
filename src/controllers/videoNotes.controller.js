import {prisma} from '../utils/prisma-client.js';

export const addNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id, timestamp_seconds, text } = req.body;
    if (!lesson_id || !text) return res.status(400).json({ message: 'lesson_id and text required' });

    const note = await prisma.videoNote.create({
      data: {
        user_id: userId,
        lesson_id,
        timestamp_seconds: Number(timestamp_seconds) || 0,
        text
      }
    });

    return res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lesson_id } = req.query;

    const notes = await prisma.videoNote.findMany({
      where: { user_id: userId, ...(lesson_id && { lesson_id }) },
      orderBy: { timestamp_seconds: 'asc' }
    });

    return res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text } = req.body;

    const updated = await prisma.videoNote.updateMany({
      where: { id, user_id: userId },
      data: { text }
    });

    if (updated.count === 0) return res.status(404).json({ message: 'Note not found' });
    return res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.videoNote.deleteMany({ where: { id, user_id: userId } });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};