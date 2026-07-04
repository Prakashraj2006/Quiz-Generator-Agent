import React, { useState } from 'react';

/**
 * QuizQuestionCard Component
 * Displays a single question, options, and handles correct answer and explanation toggle.
 */
const QuizQuestionCard = ({ question, number }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  // Map numbers to letters for MCQ option bullets
  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
  };

  const handleToggleAnswer = () => {
    setShowAnswer(prev => !prev);
  };

  return (
    <div className="question-card" id={`question-card-${number}`}>
      <div className="question-card-header">
        <span className="question-number">Question {number}</span>
        <span className={`badge badge-${question.difficulty || 'medium'}`}>
          {question.difficulty || 'medium'}
        </span>
      </div>
      
      <p className="question-text">{question.question}</p>

      {/* Render options for MCQ or True/False */}
      {question.options && question.options.length > 0 && (
        <div className="options-grid">
          {question.options.map((option, idx) => (
            <div key={idx} className="option-item">
              <span className="option-bullet">{getOptionLetter(idx)}</span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}

      {/* For Short Answer we do not display options, but direct actions */}
      {question.type === 'short_answer' && (
        <div style={{ margin: '14px 0', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          * Formulation is a short-answer format. Synthesize your answer mentally before checking.
        </div>
      )}

      <div className="answer-actions">
        <button 
          className="btn-toggle-answer" 
          onClick={handleToggleAnswer}
          aria-expanded={showAnswer}
          id={`toggle-btn-${number}`}
        >
          {showAnswer ? 'Hide Explanation' : 'View Correct Answer & Explanation'}
          <span style={{ fontSize: '10px' }}>{showAnswer ? '▲' : '▼'}</span>
        </button>
      </div>

      {showAnswer && (
        <div className="answer-details" id={`answer-details-${number}`}>
          <div className="correct-answer-text">
            ✓ Correct Answer: <span style={{ color: 'var(--text-main)' }}>{question.correctAnswer}</span>
          </div>
          {question.explanation && (
            <p className="explanation-text">
              <strong>Explanation:</strong> {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizQuestionCard;
