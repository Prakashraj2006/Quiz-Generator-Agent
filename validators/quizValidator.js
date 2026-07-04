const mongoose = require('mongoose');

// Helper to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Simple text sanitizer to remove HTML tags and trim whitespace
const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
};

/**
 * Validator middleware for generating a quiz
 */
const validateQuizGenerationInput = (req, res, next) => {
  const errors = [];
  let { topic, sourceText, difficulty, questionType, numberOfQuestions, projectId } = req.body;

  // Sanitize sourceText if provided
  if (sourceText !== undefined) {
    req.body.sourceText = sanitizeText(sourceText);
    sourceText = req.body.sourceText;
  }

  // Sanitize topic if provided
  if (topic !== undefined) {
    req.body.topic = sanitizeText(topic);
    topic = req.body.topic;
  }

  // Topic is required unless sourceText exists (and is not empty)
  if (!topic && !sourceText) {
    errors.push({
      field: 'topic',
      message: 'Topic is required unless sourceText is provided.'
    });
  }

  // Validate difficulty
  const allowedDifficulties = ['easy', 'medium', 'hard'];
  if (difficulty && !allowedDifficulties.includes(difficulty)) {
    errors.push({
      field: 'difficulty',
      message: `Difficulty must be one of: ${allowedDifficulties.join(', ')}.`
    });
  }

  // Validate questionType
  const allowedQuestionTypes = ['mcq', 'true_false', 'short_answer', 'mixed'];
  if (questionType && !allowedQuestionTypes.includes(questionType)) {
    errors.push({
      field: 'questionType',
      message: `Question type must be one of: ${allowedQuestionTypes.join(', ')}.`
    });
  }

  // Validate numberOfQuestions
  if (numberOfQuestions !== undefined) {
    const num = parseInt(numberOfQuestions, 10);
    if (isNaN(num) || num < 1 || num > 30) {
      errors.push({
        field: 'numberOfQuestions',
        message: 'Number of questions must be an integer between 1 and 30.'
      });
    } else {
      req.body.numberOfQuestions = num; // Keep as integer
    }
  }

  // Validate projectId if provided
  if (projectId && !isValidObjectId(projectId)) {
    errors.push({
      field: 'projectId',
      message: 'Invalid projectId format.'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
};

/**
 * Validator middleware for saving a generated quiz
 */
const validateQuizSaveInput = (req, res, next) => {
  const errors = [];
  const { title, questions, difficulty, questionType, projectId } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push({ field: 'title', message: 'Title is required and must be a valid string.' });
  }

  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    errors.push({ field: 'difficulty', message: 'Valid difficulty is required (easy, medium, hard).' });
  }

  if (!questionType || !['mcq', 'true_false', 'short_answer', 'mixed'].includes(questionType)) {
    errors.push({ field: 'questionType', message: 'Valid questionType is required (mcq, true_false, short_answer, mixed).' });
  }

  if (projectId && !isValidObjectId(projectId)) {
    errors.push({ field: 'projectId', message: 'Invalid projectId format.' });
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    errors.push({ field: 'questions', message: 'Questions must be a non-empty array.' });
  } else {
    // Validate each question structure
    questions.forEach((q, idx) => {
      if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
        errors.push({ field: `questions[${idx}].question`, message: 'Question text is required.' });
      }
      if (!q.type || !['mcq', 'true_false', 'short_answer'].includes(q.type)) {
        errors.push({ field: `questions[${idx}].type`, message: 'Question type must be mcq, true_false, or short_answer.' });
      }
      if (!q.correctAnswer || typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim()) {
        errors.push({ field: `questions[${idx}].correctAnswer`, message: 'Correct answer is required.' });
      }
      if (q.type === 'mcq') {
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          errors.push({ field: `questions[${idx}].options`, message: 'MCQ questions require at least two options.' });
        }
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
};

/**
 * Validator middleware for URL parameters containing quizId
 */
const validateQuizIdParam = (req, res, next) => {
  const { quizId } = req.params;

  if (!quizId || !isValidObjectId(quizId)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: [{
        field: 'quizId',
        message: 'Invalid quizId format. Must be a 24-character hexadecimal string.'
      }]
    });
  }

  next();
};

module.exports = {
  validateQuizGenerationInput,
  validateQuizSaveInput,
  validateQuizIdParam,
  isValidObjectId,
  sanitizeText
};
