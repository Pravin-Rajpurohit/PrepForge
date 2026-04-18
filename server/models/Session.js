import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: String,
  userAnswer: String,
  aiFeedback: String,
  strength: String,
  improvement: String,
  score: {
    type: Number,
    min: 0,
    max: 10
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: String,
  topic: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  mode: {
    type: String,
    enum: ['text', 'voice']
  },
  questions: [questionSchema],
  totalScore: Number,
  duration: Number, // in seconds
  completedAt: {
    type: Date,
    default: Date.now
  }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
