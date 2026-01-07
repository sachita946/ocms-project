import {prisma} from '../utils/prisma-client.js';

export const getQuizByLesson = async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    if (!lessonId) return res.status(400).json({ message: 'lessonId required' });
    const quiz = await prisma.quiz.findUnique({
      where: { lesson_id: lessonId },
      include: { questions: { include: { answers: true } } }
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const safeQuestions = (quiz.questions || []).map(q => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      points: q.points,
      answers: (q.answers || []).map(a => ({
        id: a.id,
        answer_text: a.answer_text,
        is_correct: false  // Never expose correct answers before submission
      }))
    }));
    return res.json({ id: quiz.id, title: quiz.title, passing_score: quiz.passing_score ?? 70, questions: safeQuestions });
  } catch (err) {
    console.error('getQuizByLesson', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({ include: { course: true } });
    res.json(quizzes);
  } catch (err) {
    console.error('getAllQuizzes', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    console.error('getQuiz', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { lesson_id, title, passing_score, duration } = req.body;

    if (!lesson_id || !title) {
      return res.status(400).json({ message: 'lesson_id and title required' });
    }

    // Verify the lesson exists and user owns it
    const lesson = await prisma.lesson.findUnique({
      where: { id: parseInt(lesson_id) },
      include: { course: true }
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.course.instructor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        lesson_id: parseInt(lesson_id),
        title,
        passing_score: passing_score || 70,
        duration: duration || null
      }
    });
    res.status(201).json(quiz);
  } catch (err) {
    console.error('[quizzes.createQuiz]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const p = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: { include: { course: { select: { instructor_id: true } } } }
      }
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.lesson?.course?.instructor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await prisma.quiz.update({
      where: { id },
      data: {
        title: p.title ?? undefined,
        passing_score: p.passing_score ?? undefined,
        total_marks: p.total_marks ?? undefined
      }
    });
    res.json(updated);
  } catch (err) {
    console.error('updateQuiz', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: { include: { course: { select: { instructor_id: true } } } }
      }
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.lesson?.course?.instructor_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.quiz.delete({ where: { id } });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error('deleteQuiz', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { id: quiz_id } = req.params;
    const { answers } = req.body;
    const questions = await prisma.question.findMany({ where: { quiz_id }, include: { answers: true } });
    let score = 0;
    let total = 0;
    for (const q of questions) {
      total += q.marks ?? 1;
      const provided = answers?.find(a => a.questionId === q.id);
      if (!provided) continue;
      if (q.type === 'MULTIPLE_CHOICE') {
        const correct = q.answers.find(a => a.is_correct);
        if (correct && provided.answerId === correct.id) score += q.marks ?? 1;
      }
    }
    const attempt = await prisma.quizAttempt.create({
      data: {
        user_id: req.user.id,
        quiz_id,
        score,
        total_marks: total,
        is_passed: score >= (total * 0.5),
        answers_json: JSON.stringify(answers || [])
      }
    });
    res.status(201).json(attempt);
  } catch (err) {
    console.error('submitAttempt', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAttemptsForQuiz = async (req, res) => {
  try {
    const { id: quiz_id } = req.params;
    const attempts = await prisma.quizAttempt.findMany({ where: { quiz_id }, include: { user: true } });
    res.json(attempts);
  } catch (err) {
    console.error('getAttemptsForQuiz', err);
    res.status(500).json({ message: 'Internal server error' });
  }

  
};