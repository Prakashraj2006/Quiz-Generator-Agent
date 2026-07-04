const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

// Protect all routes
router.use(auth);

/**
 * @route   GET /api/projects
 * @desc    Get user projects history
 * @access  Private
 */
router.get('/', projectController.getUserProjects);

/**
 * @route   POST /api/projects/:projectId/quiz/generate
 * @desc    Generate a customized quiz from the workspace project details
 * @access  Private
 */
router.post('/:projectId/quiz/generate', projectController.generateProjectQuiz);

module.exports = router;
