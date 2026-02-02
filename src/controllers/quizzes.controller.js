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
    const quizzes = await prisma.quiz.findMany({
      include: {
        lesson: {
          include: {
            course: true
          }
        }
      }
    });
    res.json(quizzes);
  } catch (err) {
    console.error('getAllQuizzes error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid quiz id' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (err) {
    console.error('getQuiz error:', err);
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

    if (!id) {
      return res.status(400).json({ message: 'Invalid quiz id' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: { select: { instructor_id: true } }
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Authorization check
    if (
      quiz.lesson.course.instructor_id !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Build update object safely
    const data = {};

    if (req.body.title) data.title = req.body.title;
    if (req.body.passing_score !== undefined)
      data.passing_score = parseInt(req.body.passing_score);

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data
    });

    res.json(updatedQuiz);
  } catch (err) {
    console.error('updateQuiz error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ message: 'Invalid quiz id' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            course: { select: { instructor_id: true } }
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Authorization check
    if (
      quiz.lesson.course.instructor_id !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Transaction: delete related records first
    await prisma.$transaction([
      prisma.quizAttempt.deleteMany({ where: { quiz_id: id } }),
      prisma.answer.deleteMany({
        where: { question: { quiz_id: id } }
      }),
      prisma.question.deleteMany({ where: { quiz_id: id } }),
      prisma.quiz.delete({ where: { id } })
    ]);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    console.error('deleteQuiz error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const submitAttempt = async (req, res) => {
  try {
    const quiz_id = parseInt(req.params.id);
    const { answers } = req.body;

    if (!quiz_id) {
      return res.status(400).json({ message: 'Invalid quiz id' });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    // Check quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quiz_id },
      include: { questions: { include: { answers: true } } }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Prevent multiple attempts (optional)
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quiz_id,
        user_id: req.user.id
      }
    });

    if (existingAttempt) {
      return res.status(400).json({ message: 'Quiz already submitted' });
    }

    let score = 0;
    let totalMarks = 0;

    for (const q of quiz.questions) {
      const marks = q.marks ?? 1;
      totalMarks += marks;

      const userAnswer = answers.find(a => a.questionId === q.id);
      if (!userAnswer) continue;

      if (q.question_type === 'MULTIPLE_CHOICE') {
        const correct = q.answers.find(a => a.is_correct === true);
        if (correct && userAnswer.answerId === correct.id) {
          score += marks;
        }
      }
    }

    const percentage = (score / totalMarks) * 100;
    const isPassed = percentage >= (quiz.passing_score ?? 50);

    const attempt = await prisma.quizAttempt.create({
      data: {
        user_id: req.user.id,
        quiz_id,
        score,
        total_marks: totalMarks,
        is_passed: isPassed,
        answers_json: JSON.stringify(answers)
      }
    });

    res.status(201).json({
      message: 'Quiz submitted successfully',
      result: {
        score,
        totalMarks,
        percentage,
        isPassed
      }
    });
  } catch (err) {
    console.error('submitAttempt error:', err);
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