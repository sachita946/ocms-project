import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createNotification = async (req, res) => {
  try {
    const notification = await prisma.notification.create({ data: req.body });
    res.json(notification);
  } catch (error) {
    console.error('[notifications.createNotification]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ include: { user: true } });
    res.json(notifications);
  } catch (error) {
    console.error('[notifications.getNotifications]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: parseInt(req.params.id) } });
    res.json(notification);
  } catch (error) {
    console.error('[notifications.getNotificationById]', error);
    res.status(500).json({ message: 'Internal server error' });
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
    console.error('[notifications.updateNotification]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error('[notifications.deleteNotification]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
