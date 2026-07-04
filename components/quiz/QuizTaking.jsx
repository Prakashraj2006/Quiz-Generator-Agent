import React, { useState } from 'react';

/**
 * QuizTaking Component
 * Implements question-by-question quiz taking mode.
 * Provides progress tracking, interactive choice cards, text area inputs,
 * navigation control, and warnings about unanswered questions before submission.
 */
const QuizTaking = ({ quiz, onSubmit, onBack, isLoading }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState(
    new Array(quiz.questions.length).fill('')
  );
  const [showWarning, setShowWarning] = useState(false);

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  const handleSelectOption = (option) => {
    const updated = [...answers];
    updated[currentIdx] = option;
    setAnswers(updated);
    setShowWarning(false);
  };

  const handleTextChange = (e) => {
    const updated = [...answers];
    updated[currentIdx] = e.target.value;
    setAnswers(updated);
    setShowWarning(false);
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleIndexClick = (idx) => {
    setCurrentIdx(idx);
  };

  const checkUnanswered = () => {
    return answers.some(ans => !ans || !ans.toString().trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasUnanswered = checkUnanswered();

    if (hasUnanswered && !showWarning) {
      setShowWarning(true);
      return;
    }

    // Prepare answers payload
    const answersPayload = quiz.questions.map((q, idx) => ({
      questionId: q._id ? q._id.toString() : idx.toString(),
      answer: answers[idx]
    }));

    onSubmit(answersPayload);
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="glass-card quiz-taking-container" id="quiz-taking-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button className="btn-toggle-answer" onClick={onBack} disabled={isLoading}>
          ← Quit Assessment
        </button>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}>
          QUESTION {currentIdx + 1} OF {totalQuestions}
        </span>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-bright)', margin: '0 0 16px 0' }}>
        {quiz.title}
      </h3>

      {/* Progress Bar */}
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden', marginBottom: '32px' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            background: 'linear-gradient(90deg, var(--color-primary) 0%, #a855f7 100%)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Quick Nav Indices */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {answers.map((ans, idx) => {
          const isCurrent = idx === currentIdx;
          const isAnswered = ans !== undefined && ans.toString().trim().length > 0;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleIndexClick(idx)}
              disabled={isLoading}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: isCurrent 
                  ? '1px solid var(--color-primary)' 
                  : '1px solid var(--border-color)',
                backgroundColor: isCurrent 
                  ? 'rgba(99, 102, 241, 0.15)' 
                  : (isAnswered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.01)'),
                color: isCurrent 
                  ? 'var(--color-primary)' 
                  : (isAnswered ? 'var(--color-success)' : 'var(--text-muted)'),
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              id={`nav-idx-${idx}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Body */}
      <div className="active-question-block" style={{ marginBottom: '40px', minHeight: '220px' }}>
        <span className={`badge badge-${currentQuestion.difficulty || 'medium'}`} style={{ marginBottom: '14px' }}>
          {currentQuestion.difficulty || 'medium'}
        </span>
        <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-bright)', lineHeight: '1.6', margin: '0 0 24px 0' }} id="taking-question-prompt">
          {currentQuestion.question}
        </h4>

        {/* Input formats based on question type */}
        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          <div className="options-grid">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentIdx] === option;
              return (
                <div 
                  key={idx}
                  className="option-item"
                  onClick={() => !isLoading && handleSelectOption(option)}
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.06)' : 'rgba(9, 13, 22, 0.4)',
                    boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.1)' : 'none'
                  }}
                  id={`option-${idx}`}
                >
                  <span 
                    className="option-bullet"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--text-muted)',
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: isSelected ? 'var(--text-bright)' : 'var(--text-muted)'
                    }}
                  >
                    {getOptionLetter(idx)}
                  </span>
                  <span>{option}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="form-group">
            <textarea
              id="short-answer-input"
              className="form-textarea"
              placeholder="Type your explanation or short answer here..."
              rows={5}
              value={answers[currentIdx] || ''}
              onChange={handleTextChange}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Warning Box */}
      {showWarning && (
        <div className="custom-alert error" id="unanswered-warning-alert" style={{ marginBottom: '24px' }}>
          <span>⚠️</span>
          <span>
            <strong>Warning:</strong> You have unanswered questions in this quiz. Submitting now will evaluate them as incorrect. Click <strong>Submit Quiz</strong> again to confirm.
          </span>
        </div>
      )}

      {/* Action Controls */}
      <div className="form-actions" style={{ paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-secondary" 
          onClick={handlePrev}
          disabled={currentIdx === 0 || isLoading}
          id="btn-prev-question"
        >
          Previous
        </button>

        {currentIdx < totalQuestions - 1 ? (
          <button 
            className="btn btn-secondary" 
            onClick={handleNext}
            disabled={isLoading}
            style={{ marginLeft: 'auto' }}
            id="btn-next-question"
          >
            Next Question
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={isLoading}
            style={{ marginLeft: 'auto' }}
            id="btn-submit-quiz"
          >
            {isLoading ? 'Evaluating...' : 'Submit Quiz'}
          </button>
        )}
      </div>

    </div>
  );
};

export default QuizTaking;
