const Project = require('../models/Project');
const Quiz = require('../models/Quiz');

/**
 * POST /api/projects/:projectId/quiz/generate
 * Generates a quiz from project information (description, techStack, branch, commits)
 * based on selected mode (viva, technical, presentation, api).
 */
exports.generateProjectQuiz = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { type = 'technical' } = req.body; // viva, technical, presentation, api
    const userId = req.user.id;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    // Security: check ownership
    if (project.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not authorized to access this project.'
      });
    }

    const techString = project.techStack && project.techStack.length > 0
      ? project.techStack.join(', ')
      : 'standard stack modules';

    const pTitle = project.title || 'Workspace Project';
    let quizTitle = `${pTitle} - Assessment`;
    let questions = [];

    switch (type) {
      case 'viva':
        quizTitle = `${pTitle} - Viva Defence Board`;
        questions = [
          {
            question: `In the context of project "${pTitle}", what was the primary architectural rationale behind adopting the [${techString}] tech stack?`,
            type: 'short_answer',
            correctAnswer: `Choosing the [${techString}] stack guarantees robust separation of concerns, fast component-level rendering, scale-ready databases, and active ecosystem integrations.`,
            explanation: `Adopting this architecture addresses issues like developer availability, modularity, security parameters, and data structure flexibility.`,
            difficulty: 'medium'
          },
          {
            question: `True or False: The configuration choices implemented in "${pTitle}" are optimized primarily for horizontal scaling rather than developer velocity.`,
            type: 'true_false',
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: `For startup and prototype phases, velocity is prioritized by building dynamic schemas and reusable frontend modules.`,
            difficulty: 'easy'
          },
          {
            question: `Explain how state synchronization and updates are handled across the workspace files of "${pTitle}".`,
            type: 'short_answer',
            correctAnswer: `State is managed by sharing structural context payloads, calling server APIs asynchronously, caching payloads on the client side, and syncing data fields.`,
            explanation: `Keeping server records and client views synchronized avoids layout tearing and out-of-order execution bugs.`,
            difficulty: 'hard'
          }
        ];
        break;

      case 'presentation':
        quizTitle = `${pTitle} - Pitch & Presentation Assessment`;
        questions = [
          {
            question: `Which of the following is the most compelling core value proposition of "${pTitle}" to present to stakeholders?`,
            options: [
              `Automating evaluation and workflow performance within a sleek dark theme`,
              `Removing standard authentication boundaries to speed up accesses`,
              `Slowing down processing outputs to guarantee database safety`,
              `Rebuilding all external services from scratch to avoid open-source`
            ],
            type: 'mcq',
            correctAnswer: `Automating evaluation and workflow performance within a sleek dark theme`,
            explanation: `Pitch slides must emphasize automation benefits, product velocity, user experience design, and data syncing.`,
            difficulty: 'medium'
          },
          {
            question: `True or False: When demonstrating "${pTitle}" to users, showing the full code syntax is more important than showing the user interface (UI).`,
            type: 'true_false',
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: `Stakeholders prioritize core workflows, visual cues, speed of action, and business value over codebase implementation.`,
            difficulty: 'easy'
          },
          {
            question: `How would you outline the main user workflows and features of "${pTitle}" during a 5-minute demo?`,
            type: 'short_answer',
            correctAnswer: `Start by demonstrating the main landing dashboard, show workspace project views, run an intelligent generation trigger, complete the evaluation, and review recommended topics.`,
            explanation: `A structured workflow presentation showcases immediate user-facing value and product features.`,
            difficulty: 'medium'
          }
        ];
        break;

      case 'api':
        quizTitle = `${pTitle} - API Architecture Quiz`;
        questions = [
          {
            question: `Which REST verb is most appropriate to trigger the quiz generation backend under "/api/projects/:projectId/quiz/generate"?`,
            options: ['POST', 'GET', 'PUT', 'DELETE'],
            type: 'mcq',
            correctAnswer: 'POST',
            explanation: `POST is correct because the action creates a quiz resource dynamically and processes request configurations in the body.`,
            difficulty: 'easy'
          },
          {
            question: `True or False: The API endpoints for "${pTitle}" attach JWT tokens to the Request headers to guarantee access controls.`,
            type: 'true_false',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: `JWT bearer tokens secure operations (GET, POST, DELETE), verifying the client identity on the server side.`,
            difficulty: 'medium'
          },
          {
            question: `What status code should the APIs of "${pTitle}" return if a user attempts to access a project resource they do not own?`,
            options: ['403 Forbidden', '404 Not Found', '200 OK', '500 Server Error'],
            type: 'mcq',
            correctAnswer: '403 Forbidden',
            explanation: `403 Forbidden is the HTTP standard when authentication succeeds but the client lacks permission for the resource.`,
            difficulty: 'medium'
          }
        ];
        break;

      case 'technical':
      default:
        quizTitle = `${pTitle} - Technical Stack & Workflow Quiz`;
        questions = [
          {
            question: `Which of the following database paradigms is most representative of the [${techString}] stack in "${pTitle}"?`,
            options: [
              'NoSQL document store (e.g. MongoDB) or SQL relational mapping',
              'Flat-file storage logs compiled on start',
              'Browser cache indexing only',
              'Static JSON array objects hardcoded in controller variables'
            ],
            type: 'mcq',
            correctAnswer: 'NoSQL document store (e.g. MongoDB) or SQL relational mapping',
            explanation: `Projects leverage databases to store structures like quizzes and projects for persistence.`,
            difficulty: 'easy'
          },
          {
            question: `True or False: Because the technology stack is configured as [${techString}], building the server endpoints requires separate Node.js execution cycles.`,
            type: 'true_false',
            options: ['True', 'False'],
            correctAnswer: 'False',
            explanation: `Node.js handles server listening on a single event loop process, serving requests non-blockingly.`,
            difficulty: 'medium'
          },
          {
            question: `Detail the integration steps needed to sync project git branches and readme fields with "${pTitle}".`,
            type: 'short_answer',
            correctAnswer: `Request credentials, fetch repository metadata via GitHub/Git APIs, parse file contents (e.g. README), and save parameters to MongoDB.`,
            explanation: `Integrating version control enables automated tasks, change analysis, and stack deduction.`,
            difficulty: 'hard'
          }
        ];
    }

    // Format Quiz Object
    const quizData = {
      userId,
      projectId,
      title: quizTitle,
      topic: `${pTitle} - ${type.toUpperCase()}`,
      difficulty: 'medium',
      questionType: 'mixed',
      numberOfQuestions: questions.length,
      sourceText: `Project: ${pTitle}\nDescription: ${project.description || ''}\nTech Stack: ${techString}`,
      questions,
      status: 'saved',
      generated: true,
      attempted: false,
      completed: false
    };

    // Save generated quiz to database automatically
    const newQuiz = new Quiz(quizData);
    const savedQuiz = await newQuiz.save();

    return res.status(201).json({
      success: true,
      quiz: savedQuiz
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects
 * Retrieves all projects belonging to the authenticated user.
 */
exports.getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};
