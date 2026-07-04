const express = require('express');
const router = express.Router();

const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');
const {
  validateQuizGenerationInput,
  validateQuizSaveInput,
  validateQuizIdParam
} = require('../validators/quizValidator');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route   POST /api/quiz/generate
 * @desc    Generate a quiz structure from topic or source text
 * @access  Private
 */
router.post('/generate', validateQuizGenerationInput, quizController.generateQuiz);

/**
 * @route   POST /api/quiz/save
 * @desc    Save a generated quiz to database
 * @access  Private
 */
router.post('/save', validateQuizSaveInput, quizController.saveQuiz);

/**
 * @route   GET /api/quiz/history
 * @desc    Retrieve all generated quizzes for the authenticated user
 * @access  Private
 */
router.get('/history', quizController.getQuizHistory);

/**
 * @route   GET /api/quiz/:quizId
 * @desc    Retrieve details of a specific quiz (ownership verified)
 * @access  Private
 */
router.get('/:quizId', validateQuizIdParam, quizController.getQuizById);

/**
 * @route   DELETE /api/quiz/:quizId
 * @desc    Delete a specific quiz (ownership verified)
 * @access  Private
 */
router.delete('/:quizId', validateQuizIdParam, quizController.deleteQuiz);

/**
 * @route   POST /api/quiz/:quizId/submit
 * @desc    Submit answers for evaluation and scoring
 * @access  Private
 */
router.post('/:quizId/submit', validateQuizIdParam, quizController.submitQuiz);

module.exports = router;
