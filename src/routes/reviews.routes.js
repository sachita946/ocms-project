import express from "express";
import { createReview, getReviews, getMyReviews, getReviewById, updateReview, deleteReview } from "../controllers/reviews.controller.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post("/", auth, createReview);
router.get("/", getReviews);
router.get("/my-reviews", auth, getMyReviews);
router.get("/:id", getReviewById);
router.put("/:id", auth, updateReview);
router.delete("/:id", auth, deleteReview);

export default router;
