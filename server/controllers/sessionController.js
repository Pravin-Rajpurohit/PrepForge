import Session from '../models/Session.js';
import User from '../models/User.js';
import { generateQuestions, evaluateAnswer } from '../services/gemini.js';

export const startSession = async (req, res) => {
  const { role, topic, difficulty, mode, questionCount } = req.body;
  const count = questionCount || 5;

  if (!role || !topic || !difficulty || !mode) {
    return res.status(400).json({ message: 'Missing required session parameters' });
  }

  // Generate questions using Gemini
  const questionsList = await generateQuestions({ role, topic, difficulty, count });

  // Format questions for DB
  const questions = questionsList.map(qText => ({
    questionText: qText,
    userAnswer: '',
    aiFeedback: '',
    strength: '',
    improvement: '',
    score: null
  }));

  const session = new Session({
    userId: req.user._id,
    role,
    topic,
    difficulty,
    mode,
    questions
  });

  await session.save();

  res.status(201).json({
    sessionId: session._id,
    questions: questionsList
  });
};

export const submitSession = async (req, res) => {
  const { id } = req.params;
  const { answers, duration } = req.body; // answers: array of { questionText, userAnswer }

  const session = await Session.findOne({ _id: id, userId: req.user._id });
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  // Evaluate all answers in parallel using Promise.all()
  const evaluationPromises = answers.map(async (answerData) => {
    const evalResult = await evaluateAnswer({
      questionText: answerData.questionText,
      userAnswer: answerData.userAnswer
    });

    return {
      questionText: answerData.questionText,
      userAnswer: answerData.userAnswer,
      aiFeedback: evalResult.feedback,
      strength: evalResult.strength,
      improvement: evalResult.improvement,
      score: evalResult.score
    };
  });

  const evaluatedQuestions = await Promise.all(evaluationPromises);

  // Compute total score
  const totalScore = evaluatedQuestions.reduce((acc, q) => acc + q.score, 0) / evaluatedQuestions.length;
  const roundedTotalScore = Math.round(totalScore * 10) / 10;

  // Update session
  session.questions = evaluatedQuestions;
  session.totalScore = roundedTotalScore;
  session.duration = duration;
  session.completedAt = Date.now();

  await session.save();

  // Detect weak areas (score < 6)
  const hasLowScore = evaluatedQuestions.some(q => q.score < 6);
  if (hasLowScore) {
    const user = await User.findById(req.user._id);
    if (!user.weakAreas.includes(session.topic)) {
      user.weakAreas.push(session.topic);
      await user.save();
    }
  }

  res.json(session);
};

export const getSessionById = async (req, res) => {
  const { id } = req.params;
  const session = await Session.findOne({ _id: id, userId: req.user._id });

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  res.json(session);
};

export const getSessionHistory = async (req, res) => {
  const sessions = await Session.find({ userId: req.user._id, totalScore: { $exists: true } })
    .sort({ completedAt: -1 });

  res.json(sessions);
};
