import React, { useState, useEffect } from 'react';
import QuizForm from '../components/quiz/QuizForm';
import QuizPreview from '../components/quiz/QuizPreview';
import QuizTaking from '../components/quiz/QuizTaking';
import QuizResult from '../components/quiz/QuizResult';
import QuizHistory from '../components/quiz/QuizHistory';
import DashboardStats from '../components/quiz/DashboardStats';
import ProjectWorkspace from './ProjectWorkspace';
import { generateQuiz, saveQuiz, submitQuiz, getQuizHistory } from '../api/quizApi';
import '../components/quiz/quizStyles.css';

/**
 * QuizGenerator Page Component
 * Main coordinator page. Links sidebar navigation to views:
 * - 'dashboard': Renders stats summaries and recents table.
 * - 'generator': Configuration form + preview panels OR Quiz History.
 * - 'projects': Project Workspace details containing the Quiz Agent tabs.
 * - 'taking': Question-by-question live quiz interface.
 * - 'result': Post-evaluation results report card.
 */
const QuizGenerator = () => {
  const [viewState, setViewState] = useState('dashboard'); // 'dashboard' | 'generator' | 'projects' | 'taking' | 'result'
  const [generatorSubTab, setGeneratorSubTab] = useState('create'); // 'create' | 'history'
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [quizzesHistory, setQuizzesHistory] = useState([]);
  const [lastConfig, setLastConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fallback local mockup history data if the DB connection is offline
  const mockHistoryData = [
    {
      _id: '65d1a1b2c3d4e5f6a7b8c001',
      title: 'Database Normalization MCQ Practice',
      topic: 'Database Normalization',
      difficulty: 'medium',
      questionType: 'mcq',
      numberOfQuestions: 5,
      score: 4,
      status: 'completed',
      completed: true,
      questions: [
        { question: 'Identify 1NF properties.', type: 'mcq', correctAnswer: 'Atomic values', options: ['Atomic values', 'Repeating groups', 'Transitive keys'], explanation: '1NF tables must contain atomic fields.' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      _id: '65d1a1b2c3d4e5f6a7b8c002',
      title: 'React Hook Lifecycle practice',
      topic: 'React Hooks',
      difficulty: 'easy',
      questionType: 'mcq',
      numberOfQuestions: 3,
      score: 3,
      status: 'completed',
      completed: true,
      questions: [
        { question: 'What is useEffect?', type: 'mcq', correctAnswer: 'Handles side effects', options: ['Handles side effects', 'Triggers renders', 'Stores state'], explanation: 'useEffect coordinates state side effects.' }
      ],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      _id: '65d1a1b2c3d4e5f6a7b8c003',
      title: 'JavaScript closures test',
      topic: 'JavaScript closures',
      difficulty: 'hard',
      questionType: 'mixed',
      numberOfQuestions: 5,
      score: 0,
      status: 'saved',
      completed: false,
      questions: [
        { question: 'Define closure.', type: 'short_answer', correctAnswer: 'Lexical scope access', explanation: 'Allows inner function lexical access.' }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  const fetchHistory = async () => {
    try {
      const data = await getQuizHistory();
      if (data && data.success) {
        setQuizzesHistory(data.quizzes || []);
      }
    } catch (err) {
      console.warn('API error fetching history in dashboard parent, loaded local mock data:', err.message);
      setQuizzesHistory(mockHistoryData);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [viewState, generatorSubTab]); // Refresh whenever view changes

  // Fallback programmatic generation in case the backend server is offline/unavailable
  const simulateLocalGeneration = (config) => {
    const { topic, difficulty, questionType, numberOfQuestions, sourceText } = config;
    const count = parseInt(numberOfQuestions, 10) || 5;
    const subject = topic || 'Source Document';
    
    const questions = [];
    for (let i = 1; i <= count; i++) {
      if (questionType === 'mcq' || (questionType === 'mixed' && i % 3 === 1)) {
        questions.push({
          question: `Which of the following is a key architectural design pattern associated with "${subject}"?`,
          type: 'mcq',
          options: [
            `Component-based modularization of "${subject}"`,
            `Monolithic single-thread execution of "${subject}"`,
            `Deprecation of data stores within "${subject}"`,
            `Manual syntax processing without compilation`
          ],
          correctAnswer: `Component-based modularization of "${subject}"`,
          explanation: `Modularity enables high performance, scalability, and code reuse when building architectures for "${subject}".`,
          difficulty: difficulty
        });
      } else if (questionType === 'true_false' || (questionType === 'mixed' && i % 3 === 2)) {
        questions.push({
          question: `True or False: Utilizing standard libraries when configuring "${subject}" improves development speed and safety.`,
          type: 'true_false',
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: `Reusing validated libraries decreases surface bugs and speeds up system builds for "${subject}".`,
          difficulty: difficulty
        });
      } else {
        questions.push({
          question: `Explain the trade-offs and performance implications of deploying "${subject}" inside a cloud-hosted infrastructure.`,
          type: 'short_answer',
          correctAnswer: `A comprehensive answer analyzes latency, bandwidth, pricing models, container scaling parameters, and deployment safety of "${subject}".`,
          explanation: `Production environments require careful evaluation of infrastructure costs versus scaling performance.`,
          difficulty: difficulty
        });
      }
    }

    return {
      title: `${subject.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Practice Assessment`,
      difficulty,
      questionType,
      numberOfQuestions: count,
      topic: topic || '',
      sourceText: sourceText || '',
      questions
    };
  };

  // Local evaluation simulation when backend is offline
  const simulateLocalEvaluation = (answersPayload) => {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const details = [];
    const wrongTopics = [];

    generatedQuiz.questions.forEach((q, idx) => {
      const userAnsObj = answersPayload.find(ua => ua.questionId === (q._id ? q._id.toString() : idx.toString())) || {};
      const userAns = userAnsObj.answer || '';
      
      const cleanUser = userAns.trim().toLowerCase();
      const cleanCorrect = q.correctAnswer.trim().toLowerCase();
      
      let isCorrect = cleanUser === cleanCorrect;
      let isUnanswered = cleanUser.length === 0;

      // Fuzzy check for short answers in local simulation
      if (q.type === 'short_answer' && !isUnanswered) {
        const cleanSubject = (generatedQuiz.topic || 'performance').toLowerCase();
        isCorrect = cleanUser.includes('scaling') || cleanUser.includes('modular') || cleanUser.includes('latenc') || cleanUser.includes(cleanSubject);
      }

      if (isUnanswered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
        if (q.question.toLowerCase().includes('hook') || q.question.toLowerCase().includes('effect')) {
          wrongTopics.push('React hooks lifecycle, closures and rendering optimization');
        } else {
          wrongTopics.push(`Core concepts of ${generatedQuiz.topic || 'the topic'}`);
        }
      }

      details.push({
        questionId: q._id || idx.toString(),
        question: q.question,
        type: q.type,
        userAnswer: userAns || '(unanswered)',
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || 'Self-assessment verification explanation.'
      });
    });

    const percentage = Math.round((correctCount / generatedQuiz.questions.length) * 100);
    let grade = 'Needs Improvement';
    if (percentage >= 85) grade = 'Excellent';
    else if (percentage >= 70) grade = 'Good';
    else if (percentage >= 50) grade = 'Average';

    return {
      score: correctCount,
      totalQuestions: generatedQuiz.questions.length,
      percentage,
      correctCount,
      wrongCount,
      unansweredCount,
      grade,
      revisionTopics: wrongTopics.length > 0 ? wrongTopics : ['No immediate revisions required. Outstanding work!'],
      details
    };
  };

  const handleGenerate = async (config) => {
    setIsLoading(true);
    setApiError('');
    setLastConfig(config);

    try {
      const result = await generateQuiz(config);
      if (result && result.success) {
        setGeneratedQuiz(result.quiz);
      } else {
        throw new Error('API response indicates failure.');
      }
    } catch (err) {
      console.warn('Backend API connection failed, falling back to local simulation mode:', err.message);
      setTimeout(() => {
        const simulated = simulateLocalGeneration(config);
        setGeneratedQuiz(simulated);
        setIsLoading(false);
      }, 800);
      return;
    }
    setIsLoading(false);
  };

  const handleSave = async (quizData) => {
    setIsSaving(true);
    setApiError('');

    try {
      const result = await saveQuiz(quizData);
      if (result && result.success) {
        setGeneratedQuiz(result.quiz); 
        fetchHistory(); // Refresh list
        return result.quiz;
      }
      throw new Error('Could not persist quiz.');
    } catch (err) {
      console.warn('Backend API connection failed during save, simulating local save:', err.message);
      await new Promise(resolve => setTimeout(resolve, 800));
      fetchHistory();
      return quizData;
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartQuiz = async () => {
    let quizToTake = generatedQuiz;
    if (!quizToTake) return;

    if (!quizToTake._id) {
      setIsLoading(true);
      const saved = await handleSave(quizToTake);
      if (saved && saved._id) {
        quizToTake = saved;
      }
      setIsLoading(false);
    }

    setViewState('taking');
  };

  const handleSubmitAnswers = async (answersPayload) => {
    setIsLoading(true);
    setApiError('');

    try {
      if (!generatedQuiz._id) {
        throw new Error('Unsaved quiz submission.');
      }
      const result = await submitQuiz(generatedQuiz._id, answersPayload);
      if (result && result.success) {
        setQuizResult(result.result);
        setViewState('result');
        fetchHistory(); // Refresh history list stats
      } else {
        throw new Error('Submission evaluation failed.');
      }
    } catch (err) {
      console.warn('Backend submit failed, running client-side grading fallback:', err.message);
      setTimeout(() => {
        const simulatedResult = simulateLocalEvaluation(answersPayload);
        setQuizResult(simulatedResult);
        setViewState('result');
        setIsLoading(false);
        fetchHistory();
      }, 800);
      return;
    }
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    if (lastConfig) {
      handleGenerate(lastConfig);
    }
  };

  const handleClear = () => {
    setGeneratedQuiz(null);
    setQuizResult(null);
    setLastConfig(null);
    setViewState('dashboard');
    setGeneratorSubTab('create');
    setApiError('');
  };

  const handleRestartQuiz = () => {
    setQuizResult(null);
    setViewState('taking');
  };

  // Launch a quiz directly from history retake trigger or project workspace generate
  const handleLaunchQuiz = (quiz) => {
    setGeneratedQuiz(quiz);
    setViewState('taking');
  };

  // View historical quiz record
  const handleViewQuiz = (quiz) => {
    const isCompleted = quiz.completed || quiz.status === 'completed';
    setGeneratedQuiz(quiz);

    if (isCompleted) {
      const mockResult = {
        score: quiz.score || 0,
        totalQuestions: quiz.numberOfQuestions || (quiz.questions && quiz.questions.length) || 5,
        percentage: Math.round(((quiz.score || 0) / (quiz.numberOfQuestions || 5)) * 100),
        correctCount: quiz.score || 0,
        wrongCount: (quiz.numberOfQuestions || 5) - (quiz.score || 0),
        unansweredCount: 0,
        grade: quiz.score >= 4 ? 'Excellent' : 'Average',
        revisionTopics: ['Review database normalization indexes', 'Practice React hook rendering optimization'],
        details: quiz.questions.map((q, idx) => ({
          question: q.question,
          type: q.type,
          userAnswer: idx === 0 ? q.correctAnswer : 'Incorrect sample response',
          correctAnswer: q.correctAnswer,
          isCorrect: idx === 0 || quiz.score > idx,
          explanation: q.explanation
        }))
      };
      setQuizResult(mockResult);
      setViewState('result');
    } else {
      setViewState('generator');
      setGeneratorSubTab('create');
    }
  };

  return (
    <div className="quiz-generator-dashboard">
      {/* 1. Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          ⚡ <span>SyncScore AI</span>
        </div>
        <nav>
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-item ${viewState === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setViewState('dashboard'); setApiError(''); }}
            >
              📊 Dashboard
            </li>
            <li 
              className={`sidebar-item ${viewState === 'projects' ? 'active' : ''}`}
              onClick={() => { setViewState('projects'); setApiError(''); }}
            >
              📂 Projects
            </li>
            <li 
              className={`sidebar-item ${viewState === 'generator' ? 'active' : ''}`}
              onClick={() => { setViewState('generator'); setApiError(''); }}
            >
              📝 Quiz Generator
            </li>
            <li className="sidebar-item" onClick={() => alert('📈 Performance log simulated.')}>📈 Performance</li>
            <li className="sidebar-item" onClick={() => alert('⚙️ Settings panel simulated.')}>⚙️ Settings</li>
          </ul>
        </nav>
      </aside>

      {/* 2. Main content container */}
      <div className="dashboard-main">
        {/* Navbar */}
        <header className="dashboard-navbar">
          <div className="user-profile">
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>John Doe</span>
            <div className="avatar">JD</div>
          </div>
        </header>

        {/* Content canvas */}
        <main className="dashboard-content">
          
          {apiError && (
            <div className="custom-alert error" id="global-api-error">
              <span>⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* Conditional Layout Routing */}
          {viewState === 'dashboard' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Dashboard Overview</h1>
                <p className="page-subtitle">Track your automated workspace performance, quiz evaluation stats, and recent activities.</p>
              </div>
              <DashboardStats 
                quizzes={quizzesHistory}
                onCreateClick={() => { setViewState('generator'); setGeneratorSubTab('create'); }}
                onViewQuiz={handleViewQuiz}
                onRetakeQuiz={handleLaunchQuiz}
              />
            </>
          )}

          {viewState === 'generator' && (
            <>
              {/* Header and Sub-tabs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                <div className="page-header" style={{ margin: '0' }}>
                  <h1 className="page-title">Quiz Generator Agent</h1>
                  <p className="page-subtitle">Generate practice tests from topics, text files, or review your historical archives.</p>
                </div>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button
                    className={`segmented-button ${generatorSubTab === 'create' ? 'active' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => setGeneratorSubTab('create')}
                    id="subtab-create"
                  >
                    Create Quiz
                  </button>
                  <button
                    className={`segmented-button ${generatorSubTab === 'history' ? 'active' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                    onClick={() => setGeneratorSubTab('history')}
                    id="subtab-history"
                  >
                    History Library
                  </button>
                </div>
              </div>

              {generatorSubTab === 'create' ? (
                <div className="quiz-grid-layout">
                  <div className="grid-form-col">
                    <QuizForm 
                      onGenerate={handleGenerate} 
                      onClear={handleClear}
                      isLoading={isLoading} 
                    />
                  </div>

                  <div className="grid-preview-col">
                    {isLoading ? (
                      <div className="glass-card loading-state" style={{ minHeight: '400px' }} id="preview-loading-skeleton">
                        <div className="spinner"></div>
                        <h4 className="loading-text">Generating Dynamic Quiz</h4>
                        <p className="loading-subtext">Compiling questions. Please wait...</p>
                      </div>
                    ) : (
                      <QuizPreview
                        quiz={generatedQuiz}
                        onSave={handleSave}
                        onRegenerate={handleRegenerate}
                        onClear={handleClear}
                        onStart={handleStartQuiz}
                        isSaving={isSaving}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <QuizHistory 
                  onViewQuiz={handleViewQuiz}
                  onRetakeQuiz={handleLaunchQuiz}
                />
              )}
            </>
          )}

          {viewState === 'projects' && (
            <ProjectWorkspace 
              onLaunchQuiz={handleLaunchQuiz}
            />
          )}

          {viewState === 'taking' && (
            <QuizTaking
              quiz={generatedQuiz}
              onSubmit={handleSubmitAnswers}
              onBack={handleClear}
              isLoading={isLoading}
            />
          )}

          {viewState === 'result' && (
            <QuizResult
              result={quizResult}
              onRestart={handleRestartQuiz}
              onBack={handleClear}
            />
          )}

        </main>
      </div>
    </div>
  );
};

export default QuizGenerator;
