import React, { useState } from 'react';
import QuizQuestionCard from './QuizQuestionCard';

/**
 * QuizPreview Component
 * Renders the generated quiz structure, titles, details, list of question cards,
 * action buttons (Save, Start, Regenerate, Clear), and handles empty state views.
 */
const QuizPreview = ({ quiz, onSave, onRegenerate, onClear, onStart, isSaving }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStartQuiz = () => {
    if (onStart) {
      onStart();
      return;
    }
    setQuizStarted(true);
    setTimeout(() => {
      setQuizStarted(false);
      alert('🚀 Simulation mode: Quiz started successfully!');
    }, 1000);
  };

  const handleSaveQuiz = async () => {
    if (!quiz || isSaving) return;
    try {
      await onSave(quiz);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000); // Reset toast
    } catch (err) {
      console.error(err);
    }
  };

  // If no quiz exists, render the Empty State
  if (!quiz) {
    return (
      <div className="glass-card empty-state-container" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <h3 className="empty-state-title">No Quiz Generated Yet</h3>
          <p className="empty-state-text">
            Configure the parameters in the generator form or select a template recommendation card to construct a practice quiz dynamically.
          </p>
        </div>
      </div>
    );
  }

  const getQuestionTypeLabel = (type) => {
    const labels = {
      mcq: 'MCQs',
      true_false: 'True / False',
      short_answer: 'Short Answer',
      mixed: 'Mixed Format'
    };
    return labels[type] || type;
  };

  return (
    <div className="glass-card quiz-preview-container" id="quiz-preview-section">
      {saveSuccess && (
        <div className="custom-alert success" id="save-success-toast">
          <span>✓</span>
          <span>Quiz persisted successfully to your account history!</span>
        </div>
      )}

      <div className="preview-header">
        <div className="preview-title-block">
          <h3 id="preview-title">{quiz.title}</h3>
          <div className="preview-meta-row">
            <span className={`badge badge-${quiz.difficulty}`}>
              {quiz.difficulty}
            </span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>
              {getQuestionTypeLabel(quiz.questionType)}
            </span>
            <span>•</span>
            <span>{quiz.numberOfQuestions || quiz.questions.length} Questions</span>
          </div>
        </div>
      </div>

      <div className="questions-list">
        {quiz.questions && quiz.questions.map((q, idx) => (
          <QuizQuestionCard 
            key={idx} 
            question={q} 
            number={idx + 1} 
          />
        ))}
      </div>

      <div className="form-actions" style={{ flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSaveQuiz}
          disabled={isSaving}
          id="btn-save-quiz"
        >
          {isSaving ? 'Saving...' : 'Save Quiz'}
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={handleStartQuiz}
          disabled={isSaving || quizStarted}
          id="btn-start-quiz"
        >
          {quizStarted ? 'Starting...' : 'Start Quiz'}
        </button>

        <button 
          className="btn btn-secondary" 
          onClick={onRegenerate}
          disabled={isSaving}
          id="btn-regenerate-quiz"
        >
          Regenerate
        </button>

        <button 
          className="btn btn-danger" 
          onClick={onClear}
          disabled={isSaving}
          id="btn-clear-preview"
          style={{ marginLeft: 'auto' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default QuizPreview;
