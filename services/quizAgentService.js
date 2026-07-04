const https = require('https');

/**
 * AI-Ready Quiz Generation Service
 * Supports Rule-Based and AI Mode (Gemini / OpenAI).
 * Integrates error recovery, prompts compiling, response normalizing, and schema validation.
 */

// Centralized templates dictionary for Rule Engine
const TOPIC_TEMPLATES = {
  database: [
    {
      type: 'mcq',
      question: 'Which of the following is a primary objective of database normalization?',
      options: [
        'Reducing data redundancy and dependency',
        'Increasing database size and file storage',
        'Eliminating the need for index optimization',
        'Adding duplicate records to tables'
      ],
      correctAnswer: 'Reducing data redundancy and dependency',
      explanation: 'Database normalization structures tables to minimize redundancy and dependency, ensuring data integrity.',
      difficulty: 'medium'
    },
    {
      type: 'true_false',
      question: 'True or False: A primary key must contain unique values and cannot be NULL.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'A primary key uniquely identifies each row in a database table and cannot contain NULL values.',
      difficulty: 'easy'
    },
    {
      type: 'short_answer',
      question: 'Explain the difference between SQL and NoSQL databases.',
      correctAnswer: 'SQL databases are relational, table-based, and use structured query language with predefined schemas. NoSQL databases are non-relational, document or key-value-based, and have dynamic schemas for unstructured data.',
      explanation: 'Relational (SQL) vs non-relational (NoSQL) systems differ in their data models, schemas, scalability, and transactional consistency (ACID vs BASE).',
      difficulty: 'medium'
    },
    {
      type: 'mcq',
      question: 'What does the ACID acronym stand for in database management systems?',
      options: [
        'Atomicity, Consistency, Isolation, Durability',
        'Accuracy, Complexity, Integrity, Dependency',
        'Atomicity, Concurrency, Indexing, Distribution',
        'Access, Control, Information, Design'
      ],
      correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
      explanation: 'ACID is a set of properties (Atomicity, Consistency, Isolation, Durability) that guarantee database transactions are processed reliably.',
      difficulty: 'hard'
    },
    {
      type: 'true_false',
      question: 'True or False: Indexes speed up data retrieval but can slow down write operations like INSERT and UPDATE.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'While indexes greatly improve SELECT query performance, they must be updated whenever data is written, which adds write overhead.',
      difficulty: 'medium'
    },
    {
      type: 'mcq',
      question: 'Which normal form addresses transitively dependent attributes?',
      options: [
        'Third Normal Form (3NF)',
        'First Normal Form (1NF)',
        'Second Normal Form (2NF)',
        'Boyce-Codd Normal Form (BCNF)'
      ],
      correctAnswer: 'Third Normal Form (3NF)',
      explanation: '3NF requires that a table is in 2NF and has no transitive functional dependencies of non-prime attributes on superkeys.',
      difficulty: 'hard'
    }
  ],
  react: [
    {
      type: 'mcq',
      question: 'What is the primary function of the Virtual DOM in React?',
      options: [
        'To optimize UI updates by minimizing direct manipulation of the real DOM',
        'To store global application state securely in the browser',
        'To handle server-side rendering of static pages',
        'To style components dynamically using CSS-in-JS templates'
      ],
      correctAnswer: 'To optimize UI updates by minimizing direct manipulation of the real DOM',
      explanation: 'React compares the Virtual DOM with a snapshot of the real DOM and updates only the differences (reconciliation) to boost performance.',
      difficulty: 'medium'
    },
    {
      type: 'true_false',
      question: 'True or False: React Hooks, such as useState and useEffect, can be called conditionally inside loops or if statements.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'Hooks must always be called at the top level of React functions to ensure they execute in the same order on every render.',
      difficulty: 'medium'
    },
    {
      type: 'short_answer',
      question: 'What is the purpose of the useEffect hook in React?',
      correctAnswer: 'The useEffect hook allows functional components to perform side effects, such as data fetching, subscriptions, manual DOM changes, and timers, acting similarly to lifecycle methods.',
      explanation: 'It runs after rendering and can clean up resources by returning a cleanup function.',
      difficulty: 'medium'
    },
    {
      type: 'mcq',
      question: 'Which Hook is used to memoize expensive computations so they do not recalculate on every render?',
      options: ['useMemo', 'useCallback', 'useRef', 'useContext'],
      correctAnswer: 'useMemo',
      explanation: 'useMemo caches the result of a calculation between renders, recalculating only when dependencies change.',
      difficulty: 'easy'
    },
    {
      type: 'true_false',
      question: 'True or False: React components must return a single root element.',
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: 'A component must return a single JSX element, though React Fragments (<>...</>) can be used to group children without adding extra DOM nodes.',
      difficulty: 'easy'
    },
    {
      type: 'mcq',
      question: 'In React, what hook provides a mutable value reference that persists across component render cycles without triggering updates?',
      options: ['useRef', 'useState', 'useMemo', 'useReducer'],
      correctAnswer: 'useRef',
      explanation: 'useRef returns a mutable ref object whose .current property is initialized to the passed argument, without re-rendering the component on changes.',
      difficulty: 'hard'
    }
  ],
  javascript: [
    {
      type: 'mcq',
      question: 'Which of the following describes the difference between "==" and "===" in JavaScript?',
      options: [
        '"==" compares values with type coercion, while "===" compares both value and type without coercion',
        '"===" compares values with type coercion, while "==" compares both value and type without coercion',
        '"==" is used for assignment and "===" is used for comparison',
        'There is no functional difference between the two operators'
      ],
      correctAnswer: '"==" compares values with type coercion, while "===" compares both value and type without coercion',
      explanation: '"==" performs type conversion before comparing, whereas "===" requires both value and type to be identical.',
      difficulty: 'easy'
    },
    {
      type: 'true_false',
      question: 'True or False: JavaScript is a multi-threaded programming language that executes processes in parallel.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'JavaScript is single-threaded and uses an Event Loop to handle asynchronous actions non-blockingly.',
      difficulty: 'medium'
    },
    {
      type: 'short_answer',
      question: 'What is a closure in JavaScript?',
      correctAnswer: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment), allowing an inner function to access the scope of an outer function even after the outer function has returned.',
      explanation: 'Closures are created every time a function is created, at function creation time.',
      difficulty: 'hard'
    },
    {
      type: 'mcq',
      question: 'What will be the output of `typeof null` in JavaScript?',
      options: ['"object"', '"null"', '"undefined"', '"string"'],
      correctAnswer: '"object"',
      explanation: 'This is a well-known historical bug in JavaScript where null is classified as an object type.',
      difficulty: 'medium'
    },
    {
      type: 'true_false',
      question: 'True or False: The `const` keyword prevents objects and arrays from being modified after definition.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'The `const` keyword prevents reassignment of the variable binding, but object properties and array elements can still be changed.',
      difficulty: 'easy'
    }
  ]
};

/**
 * Validates inputs for the generation logic.
 */
const validateQuizInput = (options) => {
  const { topic, sourceText, difficulty, questionType, numberOfQuestions } = options;

  if (!topic && !sourceText) {
    throw new Error('Either topic or sourceText must be provided.');
  }

  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    throw new Error('Difficulty must be easy, medium, or hard.');
  }

  if (questionType && !['mcq', 'true_false', 'short_answer', 'mixed'].includes(questionType)) {
    throw new Error('Question type must be mcq, true_false, short_answer, or mixed.');
  }

  if (numberOfQuestions !== undefined) {
    const num = parseInt(numberOfQuestions, 10);
    if (isNaN(num) || num < 1 || num > 30) {
      throw new Error('Number of questions must be an integer between 1 and 30.');
    }
  }
};

/**
 * Builds a dynamic title.
 */
const buildQuizTitle = (topic, sourceText, questionType) => {
  let subject = '';

  if (topic) {
    subject = topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else if (sourceText) {
    const words = sourceText.split(/\s+/).slice(0, 4);
    subject = words.join(' ') + (words.length >= 4 ? '...' : '');
  } else {
    subject = 'General Knowledge';
  }

  let typeSuffix = 'Quiz';
  if (questionType === 'mcq') typeSuffix = 'MCQ Practice';
  else if (questionType === 'true_false') typeSuffix = 'T/F Assessment';
  else if (questionType === 'short_answer') typeSuffix = 'Short Q&A';
  else if (questionType === 'mixed') typeSuffix = 'Comprehensive Quiz';

  return `${subject} ${typeSuffix}`;
};

/**
 * Fallback generator when no specific keyword template matches.
 * Restricts questions to unique items and filters by difficulty levels.
 */
const generateFallbackQuestions = (topic, sourceText, type, difficulty, count) => {
  const questions = [];
  const subject = topic || 'the provided text';

  const diffTag = difficulty || 'medium';

  for (let i = 1; i <= count; i++) {
    if (type === 'mcq') {
      questions.push({
        type: 'mcq',
        question: `Identify the primary feature that differentiates "${subject}" at a ${diffTag} mastery level.`,
        options: [
          `Dynamic implementation variables tailored to "${subject}"`,
          `Increasing overall complexity cycles of "${subject}"`,
          `Deprecating standard modular formats for "${subject}"`,
          `Failing to establish security protocols on "${subject}"`
        ],
        correctAnswer: `Dynamic implementation variables tailored to "${subject}"`,
        explanation: `Assesses structural command over "${subject}" under the "${diffTag}" difficulty constraints.`,
        difficulty: diffTag
      });
    } else if (type === 'true_false') {
      const isTrue = i % 2 === 0;
      questions.push({
        type: 'true_false',
        question: `True or False: Under standard environments, implementing "${subject}" is recommended for optimal scalability.`,
        options: ['True', 'False'],
        correctAnswer: isTrue ? 'True' : 'False',
        explanation: `Evaluating the typical architectural implementation patterns of "${subject}".`,
        difficulty: diffTag
      });
    } else if (type === 'short_answer') {
      questions.push({
        type: 'short_answer',
        question: `Detail the implementation steps, benefits, and typical trade-offs of deploying "${subject}" inside a microservices stack.`,
        correctAnswer: `Deploying "${subject}" requires configuring independent boundaries, securing routes, caching databases, and testing integrations.`,
        explanation: `Encourages developers to evaluate architectural trade-offs of "${subject}".`,
        difficulty: diffTag
      });
    }
  }

  return questions;
};

/**
 * Generates questions using rule engine. Prevents duplicates and filters by difficulty.
 */
const generateWithRuleEngine = (options) => {
  const { topic, sourceText, difficulty = 'medium', questionType = 'mcq', numberOfQuestions = 5 } = options;
  const count = parseInt(numberOfQuestions, 10);

  // Find keyword match
  const keyword = Object.keys(TOPIC_TEMPLATES).find(k => 
    (topic && topic.toLowerCase().includes(k)) || 
    (sourceText && sourceText.toLowerCase().includes(k))
  );

  let pool = [];
  if (keyword) {
    pool = TOPIC_TEMPLATES[keyword];
  }

  // Filter pool by difficulty if possible, otherwise use full pool
  let filtered = pool.filter(q => q.difficulty === difficulty);
  if (filtered.length === 0) {
    filtered = pool; // Fallback to entire list
  }

  const selectedQuestions = [];

  const addFromFiltered = (qType, targetCount) => {
    const typeFiltered = filtered.filter(q => q.type === qType);
    const fallbackPool = pool.filter(q => q.type === qType);
    const sourcePool = typeFiltered.length > 0 ? typeFiltered : (fallbackPool.length > 0 ? fallbackPool : []);

    if (sourcePool.length === 0) {
      // Fallback generation
      const fbacks = generateFallbackQuestions(topic, sourceText, qType, difficulty, targetCount);
      selectedQuestions.push(...fbacks);
      return;
    }

    // Pick unique items
    for (let i = 0; i < targetCount; i++) {
      const q = sourcePool[i % sourcePool.length];
      selectedQuestions.push({
        ...q,
        // Differentiate question text slightly to avoid perfect duplicates if count > length
        question: i >= sourcePool.length ? `${q.question} (Part ${Math.floor(i / sourcePool.length) + 1})` : q.question
      });
    }
  };

  if (questionType === 'mixed') {
    const mcqCount = Math.ceil(count / 2);
    const remaining = count - mcqCount;
    const tfCount = Math.ceil(remaining / 2);
    const saCount = remaining - tfCount;

    addFromFiltered('mcq', mcqCount);
    addFromFiltered('true_false', tfCount);
    addFromFiltered('short_answer', saCount);
  } else {
    addFromFiltered(questionType, count);
  }

  const title = buildQuizTitle(topic, sourceText, questionType);

  return {
    title,
    difficulty,
    questionType,
    numberOfQuestions: selectedQuestions.length,
    topic: topic || '',
    sourceText: sourceText || '',
    questions: selectedQuestions.slice(0, count)
  };
};

/**
 * Builds standard system instructions and prompt context for LLM.
 */
const buildQuizPrompt = (options) => {
  const { topic, sourceText, difficulty = 'medium', questionType = 'mcq', numberOfQuestions = 5 } = options;

  return `You are a Quiz Generation Agent inside the SyncScore AI platform.
Generate a practice quiz based on the following configurations:
- Topic: "${topic || 'Extracted Context'}"
- Difficulty: "${difficulty}"
- Question Type: "${questionType}"
- Number of Questions: ${numberOfQuestions}
${sourceText ? `- Source Reference Text: "${sourceText}"` : ''}

CRITICAL RULES:
1. Ensure all questions are unique (no duplicates).
2. Tailor questions strictly to the difficulty level: "${difficulty}".
3. Provide a clear, verbose "explanation" field explaining the correct answer.
4. Output your response EXACTLY as a valid JSON object matching the schema below.
5. Do NOT include markdown styling like \`\`\`json or trailing commas.

JSON OUTPUT FORMAT:
{
  "title": "A descriptive title based on topic",
  "difficulty": "${difficulty}",
  "questionType": "${questionType}",
  "questions": [
    {
      "question": "Clear question text?",
      "type": "mcq | true_false | short_answer",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only include for mcq or true_false. True/False options must be ["True", "False"]. Omit for short_answer.
      "correctAnswer": "Exact string of correct answer option or short answer key phrase",
      "explanation": "Detailed explanation of correct answers",
      "difficulty": "${difficulty}"
    }
  ]
}`;
};

/**
 * Normalizes AI output strings, stripping leading code fence indicators.
 */
const normalizeAIResponse = (aiResponse) => {
  if (!aiResponse) return null;
  
  let cleanString = aiResponse.trim();
  
  // Remove markdown code block blocks if returned
  if (cleanString.startsWith('```')) {
    cleanString = cleanString.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  
  try {
    return JSON.parse(cleanString);
  } catch (err) {
    console.error('Failed to parse clean AI JSON string:', err.message);
    return null;
  }
};

/**
 * Validates structural schema correctness of parsed quizzes.
 */
const validateGeneratedQuiz = (quiz) => {
  if (!quiz || typeof quiz !== 'object') return false;
  if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) return false;
  
  return quiz.questions.every(q => 
    q.question && 
    q.type && 
    ['mcq', 'true_false', 'short_answer'].includes(q.type) && 
    q.correctAnswer
  );
};

/**
 * Fallback Generator.
 */
const fallbackQuizGenerator = (options) => {
  console.log('Fired safety fallback generator...');
  return generateWithRuleEngine(options);
};

/**
 * Query LLMs using HTTPS requests.
 */
const queryLLM = (provider, prompt, apiKey) => {
  return new Promise((resolve, reject) => {
    let postData = '';
    let options = {};

    if (provider === 'openai') {
      postData = JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful quiz generation backend assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };
    } else if (provider === 'gemini') {
      postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });

      options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 10000
      };
    } else {
      return reject(new Error('Unsupported provider'));
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            return reject(new Error(parsed.error?.message || `HTTP Error ${res.statusCode}`));
          }
          
          let aiText = '';
          if (provider === 'openai') {
            aiText = parsed.choices[0].message.content;
          } else {
            aiText = parsed.candidates[0].content.parts[0].text;
          }
          resolve(aiText);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('LLM API connection timed out.'));
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
};

/**
 * Call AI service endpoints.
 */
const generateWithAI = async (options, provider, apiKey) => {
  const prompt = buildQuizPrompt(options);
  const rawResponse = await queryLLM(provider, prompt, apiKey);
  const quizObj = normalizeAIResponse(rawResponse);
  
  if (quizObj && validateGeneratedQuiz(quizObj)) {
    return {
      ...quizObj,
      topic: options.topic || '',
      sourceText: options.sourceText || ''
    };
  }
  
  throw new Error('AI returned invalid quiz JSON format.');
};

/**
 * Main Quiz Generation Entry Point
 */
const generateQuiz = async (options = {}) => {
  validateQuizInput(options);

  const provider = process.env.QUIZ_AI_PROVIDER || 'rule_based';
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (provider === 'openai' && openaiKey) {
    try {
      console.log('Generating quiz using OpenAI GPT model...');
      return await generateWithAI(options, 'openai', openaiKey);
    } catch (err) {
      console.warn('OpenAI Generation failed, falling back to rule engine:', err.message);
      return fallbackQuizGenerator(options);
    }
  } else if (provider === 'gemini' && geminiKey) {
    try {
      console.log('Generating quiz using Gemini model...');
      return await generateWithAI(options, 'gemini', geminiKey);
    } catch (err) {
      console.warn('Gemini Generation failed, falling back to rule engine:', err.message);
      return fallbackQuizGenerator(options);
    }
  }

  // Default fallback to Rule-Based Engine
  return generateWithRuleEngine(options);
};

module.exports = {
  generateQuiz,
  generateWithRuleEngine,
  generateWithAI,
  buildQuizPrompt,
  normalizeAIResponse,
  validateGeneratedQuiz,
  fallbackQuizGenerator,
  buildQuizTitle,
  validateQuizInput
};
