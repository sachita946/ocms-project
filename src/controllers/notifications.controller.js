import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create notification
export const createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type, is_read } = req.body;

    if (!user_id || !message) {
      return res.status(400).json({ message: "user_id and message are required" });
    }

    const notification = await prisma.notification.create({
      data: {
        user_id,
        title,
        message,
        type,
        is_read: is_read ?? false, // default to false if not provided
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('[notifications.createNotification]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ include: { user: true } });
    res.json(notifications);
  } catch (error) {
    console.error('[notifications.getNotifications]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get by ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ 
      where: { id: parseInt(req.params.id) } 
    });
    res.json(notification);
  } catch (error) {
    console.error('[notifications.getNotificationById]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update notification
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

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error('[notifications.deleteNotification]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
