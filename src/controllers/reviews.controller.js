import {prisma} from '../utils/prisma-clients.js';

export const createReview = async (req, res) => {
  try {
    const review = await prisma.review.create({ data: req.body });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ include: { student: true, course: true } });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.id) } });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
