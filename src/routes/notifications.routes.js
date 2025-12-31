import express from "express";
import { createNotification, getNotifications, getNotificationById, updateNotification, deleteNotification } from "../controllers/notifications.controller.js";
const router = express.Router();

router.post('/', createNotification);
router.get('/', getNotifications);
router.get('/:id', getNotificationById);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);
export default router;
