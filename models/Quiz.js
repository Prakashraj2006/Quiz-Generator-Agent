const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    required: true
  },
  options: {
    type: [String],
    default: undefined // Ensures we only save it when applicable (e.g. MCQs)
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { _id: true });

const QuizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    trim: true,
    required: function() {
      // Topic is required unless sourceText exists
      return !this.sourceText;
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'medium'
  },
  questionType: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer', 'mixed'],
    required: true,
    default: 'mcq'
  },
  numberOfQuestions: {
    type: Number,
    required: true,
    min: 1,
    max: 30,
    default: 5
  },
  sourceText: {
    type: String,
    trim: true
  },
  questions: {
    type: [QuestionSchema],
    required: true,
    default: []
  },
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'saved', 'active', 'completed'],
    default: 'saved'
  },
  generated: {
    type: Boolean,
    default: true
  },
  attempted: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true // Adds updatedAt and createdAt automatically
});

// Calculate totalQuestions dynamically before saving
QuizSchema.pre('save', function(next) {
  if (this.questions) {
    this.totalQuestions = this.questions.length;
  }
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);
