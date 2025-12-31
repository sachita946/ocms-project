import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createNotification = async (req, res) => {
  try {
    const notification = await prisma.notification.create({ data: req.body });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ include: { user: true } });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: parseInt(req.params.id) } });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
