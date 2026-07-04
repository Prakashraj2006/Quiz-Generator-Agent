const Quiz = require('../models/Quiz');
const quizAgentService = require('../services/quizAgentService');

/**
 * POST /api/quiz/generate
 * Generates a quiz structure without saving it to the database.
 */
exports.generateQuiz = async (req, res, next) => {
  try {
    const { topic, sourceText, difficulty, questionType, numberOfQuestions, projectId } = req.body;

    const generatedQuiz = await quizAgentService.generateQuiz({
      topic,
      sourceText,
      difficulty,
      questionType,
      numberOfQuestions
    });

    // Attach projectId to the response for client reference, if provided
    if (projectId) {
      generatedQuiz.projectId = projectId;
    }

    return res.status(200).json({
      success: true,
      quiz: generatedQuiz
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/quiz/save
 * Saves a generated quiz into the database.
 */
exports.saveQuiz = async (req, res, next) => {
  try {
    const {
      title,
      topic,
      sourceText,
      difficulty,
      questionType,
      numberOfQuestions,
      questions,
      projectId
    } = req.body;

    const userId = req.user.id;

    // Create a new Quiz instance
    const newQuiz = new Quiz({
      userId,
      projectId: projectId || undefined,
      title,
      topic: topic || undefined,
      sourceText: sourceText || undefined,
      difficulty,
      questionType,
      numberOfQuestions: numberOfQuestions || questions.length,
      questions,
      status: 'saved',
      generated: true,
      attempted: false,
      completed: false
    });

    const savedQuiz = await newQuiz.save();

    return res.status(201).json({
      success: true,
      message: 'Quiz saved successfully.',
      quiz: savedQuiz
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quiz/history
 * Retrieves all quizzes belonging to the authenticated user.
 */
exports.getQuizHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Retrieve and sort by newest first
    const quizzes = await Quiz.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quiz/:quizId
 * Retrieves a single quiz by ID, verifying user ownership.
 */
exports.getQuizById = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    // Security: check ownership
    if (quiz.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to view this quiz.'
      });
    }

    return res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/quiz/:quizId
 * Deletes a quiz by ID, verifying user ownership.
 */
exports.deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    // Security: check ownership
    if (quiz.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to delete this quiz.'
      });
    }

    await Quiz.findByIdAndDelete(quizId);

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/quiz/:quizId/submit
 * Submits quiz answers, evaluates performance, updates database, and returns score summaries.
 */
exports.submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId: String, answer: String } or String[]
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    // Security: check ownership
    if (quiz.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to submit this quiz.'
      });
    }

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const details = [];
    const wrongTopics = [];

    // Helper for fuzzy comparison of answers
    const isAnswerCorrect = (userAns, correctAns, type) => {
      if (!userAns || typeof userAns !== 'string' || !userAns.trim()) {
        return { isCorrect: false, isUnanswered: true };
      }
      
      const cleanUser = userAns.trim().toLowerCase();
      const cleanCorrect = correctAns.trim().toLowerCase();
      
      if (type === 'mcq' || type === 'true_false') {
        return { isCorrect: cleanUser === cleanCorrect, isUnanswered: false };
      }
      
      // Short Answer grading: check key word overlap
      const stopwords = new Set(['the', 'is', 'are', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
      const userWords = cleanUser.split(/[\s,.\-!?]+/).filter(w => w.length > 2 && !stopwords.has(w));
      const correctWords = cleanCorrect.split(/[\s,.\-!?]+/).filter(w => w.length > 2 && !stopwords.has(w));
      
      if (correctWords.length === 0) {
        return { isCorrect: cleanUser.length > 0, isUnanswered: false };
      }
      
      // Count matches
      const matchedWords = correctWords.filter(cw => cleanUser.includes(cw));
      const ratio = matchedWords.length / correctWords.length;
      
      return { isCorrect: ratio >= 0.4, isUnanswered: false }; // 40% matching key terms is correct
    };

    // Mapping keyword targets to suggested revision topics
    const revisionMappings = [
      { keywords: ['hook', 'useeffect', 'usestate', 'usememo', 'usecallback'], topic: 'React hooks lifecycle, closures and rendering optimization' },
      { keywords: ['virtual dom', 'reconciliation', 'render', 'jsx'], topic: 'Virtual DOM, component cycles, and React fiber' },
      { keywords: ['normalization', '1nf', '2nf', '3nf', 'redundancy', 'normal form'], topic: 'Relational database schema normalization (1NF, 2NF, 3NF)' },
      { keywords: ['acid', 'atomicity', 'transaction', 'isolation'], topic: 'Database transaction properties (ACID) and consistency levels' },
      { keywords: ['closure', 'scope', 'lexical'], topic: 'JavaScript lexical scope, execution contexts, and closures' },
      { keywords: ['index', 'b-tree', 'scan', 'speed'], topic: 'Database query execution planning and index configuration' },
      { keywords: ['nosql', 'sql', 'relational', 'document'], topic: 'Relational vs non-relational storage trade-offs and modeling' }
    ];

    // Evaluate each question
    quiz.questions.forEach((q, idx) => {
      let userAnswerVal = '';

      if (Array.isArray(answers)) {
        // Find by questionId or index
        const userAnsObj = answers.find(ua => ua && ua.questionId === q._id.toString());
        if (userAnsObj) {
          userAnswerVal = userAnsObj.answer;
        } else if (answers[idx] !== undefined && typeof answers[idx] === 'string') {
          userAnswerVal = answers[idx];
        }
      }

      const { isCorrect, isUnanswered } = isAnswerCorrect(userAnswerVal, q.correctAnswer, q.type);

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
        // Extract revision suggestions for wrong answers
        const questionText = q.question.toLowerCase();
        let matched = false;

        for (const mapping of revisionMappings) {
          if (mapping.keywords.some(kw => questionText.includes(kw))) {
            wrongTopics.push(mapping.topic);
            matched = true;
          }
        }

        if (!matched && quiz.topic) {
          wrongTopics.push(`Core concepts of ${quiz.topic}`);
        }
      }

      details.push({
        questionId: q._id,
        question: q.question,
        type: q.type,
        userAnswer: userAnswerVal || '(unanswered)',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      });
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    // Assign Grades
    let grade = 'Needs Improvement';
    if (percentage >= 85) grade = 'Excellent';
    else if (percentage >= 70) grade = 'Good';
    else if (percentage >= 50) grade = 'Average';

    // Deduplicate revision suggestions
    const revisionTopics = [...new Set(wrongTopics)];

    // Update database fields
    quiz.score = correctCount;
    quiz.status = 'completed';
    quiz.attempted = true;
    quiz.completed = true;
    quiz.completedAt = new Date();

    await quiz.save();

    return res.status(200).json({
      success: true,
      result: {
        score: correctCount,
        totalQuestions,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount,
        grade,
        revisionTopics: revisionTopics.length > 0 ? revisionTopics : ['No immediate revisions required. Outstanding work!'],
        details
      }
    });
  } catch (error) {
    next(error);
  }
};
