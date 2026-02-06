import {prisma} from '../utils/prisma-client.js';

export const createReview = async (req, res) => {
  try {
    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found. Please complete your profile.' });
    }

    const review = await prisma.review.create({
      data: {
        student_id: studentProfile.id,
        course_id: req.body.course_id,
        rating: req.body.rating,
        comment: req.body.comment,
        userId: req.user.id
      }
    });
    res.json(review);
  } catch (error) {
    console.error('[reviews.createReview]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    // Get student profile ID from user ID
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { user_id: req.user.id }
    });

    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile not found.' });
    }

    const reviews = await prisma.review.findMany({
      where: { student_id: studentProfile.id },
      include: { course: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    console.error('[reviews.getMyReviews]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ include: { student: true, course: true } });
    res.json(reviews);
  } catch (error) {
    console.error('[reviews.getReviews]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.id) } });
    res.json(review);
  } catch (error) {
    console.error('[reviews.getReviewById]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id },
      include: { student: { select: { user_id: true } } }
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    const ownerId = review.userId || review.student?.user_id;
    if (req.user.role !== 'ADMIN' && ownerId && ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: req.body,
    });
    res.json(updatedReview);
  } catch (error) {
    console.error('[reviews.updateReview]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id },
      include: { student: { select: { user_id: true } } }
    });

    if (!review) return res.status(404).json({ message: 'Review not found' });

    const ownerId = review.userId || review.student?.user_id;
    if (req.user.role !== 'ADMIN' && ownerId && ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error('[reviews.deleteReview]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
