import React, { useState } from 'react';

/**
 * QuizForm Component
 * Displays inputs for topic, difficulty, type, and source text.
 * Renders interactive suggestion cards that auto-fill the form inputs.
 */
const QuizForm = ({ onGenerate, onClear, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionType, setQuestionType] = useState('mcq');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [sourceText, setSourceText] = useState('');
  const [validationError, setValidationError] = useState('');

  // Suggestion card templates
  const suggestions = [
    {
      label: 'Generate 10 MCQs on React Hooks',
      data: {
        topic: 'React Hooks',
        difficulty: 'medium',
        questionType: 'mcq',
        numberOfQuestions: 10,
        sourceText: ''
      }
    },
    {
      label: 'Create a hard quiz on MongoDB Aggregation',
      data: {
        topic: 'MongoDB Aggregation',
        difficulty: 'hard',
        questionType: 'mcq',
        numberOfQuestions: 5,
        sourceText: ''
      }
    },
    {
      label: 'Generate viva questions for my final-year project',
      data: {
        topic: 'Final-Year Project',
        difficulty: 'medium',
        questionType: 'short_answer',
        numberOfQuestions: 5,
        sourceText: 'Architecture overview of the project, covering key modules and database relationships.'
      }
    },
    {
      label: 'Generate a mixed quiz from project documentation',
      data: {
        topic: '',
        difficulty: 'medium',
        questionType: 'mixed',
        numberOfQuestions: 5,
        sourceText: 'SyncScore AI is an intelligent dashboard application leveraging MERN Stack for score syncing. Users can configure project repos, run automations, and take quizzes to test subject command.'
      }
    },
    {
      label: 'Generate interview questions from MERN Stack',
      data: {
        topic: 'MERN Stack Developer Interview',
        difficulty: 'hard',
        questionType: 'short_answer',
        numberOfQuestions: 8,
        sourceText: ''
      }
    }
  ];

  const handleSuggestionClick = (data) => {
    setTopic(data.topic);
    setDifficulty(data.difficulty);
    setQuestionType(data.questionType);
    setNumberOfQuestions(data.numberOfQuestions);
    setSourceText(data.sourceText);
    setValidationError('');
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    setNumberOfQuestions(prev => Math.min(prev + 1, 30));
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    setNumberOfQuestions(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Topic is required unless sourceText exists
    const cleanTopic = topic.trim();
    const cleanSourceText = sourceText.trim();

    if (!cleanTopic && !cleanSourceText) {
      setValidationError('Please specify a Topic or insert Source Text context.');
      return;
    }

    onGenerate({
      topic: cleanTopic,
      difficulty,
      questionType,
      numberOfQuestions,
      sourceText: cleanSourceText
    });
  };

  const handleFormClear = (e) => {
    e.preventDefault();
    setTopic('');
    setDifficulty('medium');
    setQuestionType('mcq');
    setNumberOfQuestions(5);
    setSourceText('');
    setValidationError('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="glass-card quiz-form-container">
      {/* Suggestions header and grid */}
      <div className="suggestions-section">
        <h4 className="suggestions-title">Quick Suggestion Templates</h4>
        <div className="suggestions-grid">
          {suggestions.map((s, index) => (
            <div 
              key={index} 
              className="suggestion-card" 
              onClick={() => handleSuggestionClick(s.data)}
              role="button"
              tabIndex={0}
              id={`suggestion-card-${index}`}
            >
              <span className="suggestion-icon">✦</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)', margin: '24px 0' }} />

      {validationError && (
        <div className="custom-alert error" id="form-validation-error">
          <span>⚠️</span>
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="topic-input">Quiz Topic</label>
          <input 
            type="text" 
            id="topic-input" 
            className="form-input" 
            placeholder="e.g., Database Normalization, JavaScript Closures"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Difficulty Level</label>
          <div className="segmented-control" id="difficulty-control">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                type="button"
                className={`segmented-button ${difficulty === level ? 'active' : ''}`}
                onClick={() => setDifficulty(level)}
                disabled={isLoading}
                id={`diff-btn-${level}`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="type-select">Question Type</label>
            <select
              id="type-select"
              className="form-select"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              disabled={isLoading}
            >
              <option value="mcq">MCQs (Multiple Choice)</option>
              <option value="true_false">True / False</option>
              <option value="short_answer">Short Answer</option>
              <option value="mixed">Mixed Assessment</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Questions</label>
            <div className="number-selector" id="questions-selector">
              <button 
                className="number-btn" 
                onClick={handleDecrement}
                disabled={numberOfQuestions <= 1 || isLoading}
                aria-label="Decrease"
              >
                −
              </button>
              <span className="number-value">{numberOfQuestions}</span>
              <button 
                className="number-btn" 
                onClick={handleIncrement}
                disabled={numberOfQuestions >= 30 || isLoading}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="source-textarea">Source Text (Optional)</label>
          <textarea
            id="source-textarea"
            className="form-textarea"
            placeholder="Paste raw notes, code documentation, or context content to extract questions directly..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ flexGrow: 2 }}
            id="btn-generate"
          >
            {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleFormClear}
            disabled={isLoading}
            id="btn-clear"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
