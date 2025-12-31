
// import prisma from '../utils/prisma-client.js';

// export const getQuizByLesson = async (req, res) => {
//   try {
//     const lessonId = parseInt(req.params.lessonId);
//     const quiz = await prisma.quiz.findUnique({ where: { lesson_id: lessonId }, include: { questions: { include: { answers: true } } } });
//     if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
//     // Do not return correct answers in real app; for now return structure but filter answers.is_correct=false for client quiz display
//     const safeQuestions = quiz.questions.map(q => ({ id: q.id, question_text: q.question_text, question_type: q.question_type, points: q.points, answers: q.answers.map(a => ({ id: a.id, answer_text: a.answer_text })) }));
//     return res.json({ id: quiz.id, title: quiz.title, passing_score: quiz.passing_score, total_marks: quiz.total_marks, questions: safeQuestions });
//   } catch (err) {
//     console.error('getQuizByLesson', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// export const submitAttempt = async (req, res) => {
//   try {
//     const studentProfileId = req.studentProfileId;
//     if (!studentProfileId) return res.status(400).json({ message: 'Student profile not found' });

//     const { quiz_id, answers /* client-submitted answers */ } = req.body;
//     if (!quiz_id || !Array.isArray(answers)) return res.status(400).json({ message: 'quiz_id and answers required' });

//     // Simplified scoring: compute score by comparing answer ids against correct answers
//     const quiz = await prisma.quiz.findUnique({ where: { id: quiz_id }, include: { questions: { include: { answers: true } } } });
//     if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

//     // compute total marks and obtained
//     let totalMarks = 0;
//     let obtained = 0;
//     for (const q of quiz.questions) {
//       totalMarks += q.points;
//       const correctAnswers = q.answers.filter(a => a.is_correct).map(a => String(a.id));
//       const given = (answers.find(a => Number(a.question_id) === q.id)?.answer_ids || []).map(String);
//       // simple: full points if any of the given equals any correct (for MCQ single-correct)
//       if (correctAnswers.length && given.some(g => correctAnswers.includes(g))) {
//         obtained += q.points;
//       }
//     }

//     const percent = totalMarks ? (obtained / totalMarks) * 100 : 0;
//     const is_passed = quiz.passing_score ? percent >= quiz.passing_score : true;

//     const attempt = await prisma.quizAttempt.create({
//       data: { student_id: studentProfileId, quiz_id, score: obtained, is_passed }
//     });

//     return res.json({ attempt_id: attempt.id, score: obtained, total_marks: totalMarks, percent, is_passed });
//   } catch (err) {
//     console.error('submitAttempt', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
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
      question_text: q.question_text || q.text || '',
      question_type: q.question_type || q.type || 'MULTIPLE_CHOICE',
      points: q.points ?? q.marks ?? 1,
      answers: (q.answers || []).map(a => ({ id: a.id, answer_text: a.answer_text || a.text || '' }))
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
    const p = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        title: p.title,
        course_id: p.course_id,
        passing_score: p.passing_score ?? null,
        total_marks: p.total_marks ?? null
      }
    });
    res.status(201).json(quiz);
  } catch (err) {
    console.error('createQuiz', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const p = req.body;
    const updated = await prisma.quiz.update({
      where: { id },
      data: { title: p.title ?? undefined, passing_score: p.passing_score ?? undefined, total_marks: p.total_marks ?? undefined }
    });
    res.json(updated);
  } catch (err) {
    console.error('updateQuiz', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
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