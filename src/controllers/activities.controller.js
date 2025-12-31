import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createActivity = async (req, res) => {
  try {
    const activity = await prisma.activity.create({ data: req.body });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({ include: { user: true, lesson: true, course: true } });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({ where: { id: parseInt(req.params.id) } });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    await prisma.activity.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
