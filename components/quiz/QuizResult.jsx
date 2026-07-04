import React from 'react';

/**
 * QuizResult Component
 * Displays evaluation dashboard (Score, Percentage, Grade, breakdown stats).
 * Displays recommended revision topics.
 * Displays detailed question-by-question review of user vs correct answers.
 */
const QuizResult = ({ result, onRestart, onBack }) => {
  const {
    score,
    totalQuestions,
    percentage,
    correctCount,
    wrongCount,
    unansweredCount,
    grade,
    revisionTopics,
    details
  } = result;

  const getGradeClass = (g) => {
    switch (g) {
      case 'Excellent': return 'badge-easy';
      case 'Good': return 'badge-medium';
      case 'Average': return 'badge-medium';
      default: return 'badge-hard';
    }
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="quiz-result-container" id="quiz-result-section" style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* 1. Score Summary Dashboard Card */}
      <div className="glass-card" style={{ marginBottom: '32px', textAlign: 'center', padding: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-bright)', margin: '0 0 8px 0' }}>
          Assessment Report Card
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 32px 0' }}>
          Your performance has been evaluated by the Quiz Agent grading core.
        </p>

        {/* Scoring Circle Graphic */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          
          <div style={{ position: 'relative', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', border: '6px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-bright)' }}>{percentage}%</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginTop: '2px' }}>Score</span>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Grade Performance: </span>
              <span className={`badge ${getGradeClass(grade)}`} style={{ fontSize: '13px', padding: '6px 12px' }} id="result-grade-badge">
                {grade}
              </span>
            </div>
            
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-bright)', margin: '0 0 16px 0' }}>
              {score} / {totalQuestions} Questions Correct
            </h3>

            {/* Micro Breakdown Stats */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                <span style={{ color: 'var(--text-muted)' }}>{correctCount} Correct</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                <span style={{ color: 'var(--text-muted)' }}>{wrongCount} Wrong</span>
              </div>
              {unansweredCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748b' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{unansweredCount} Unanswered</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* 2. Revision Recommendations */}
      <div className="glass-card" style={{ marginBottom: '32px', borderColor: 'rgba(99, 102, 241, 0.2)', backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-bright)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💡 Recommended Revision Focus
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
          Based on questions answered incorrectly, the agent suggests reviewing the following subject segments:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} id="revision-topics-list">
          {revisionTopics.map((topic, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                fontSize: '13px', 
                padding: '10px 14px', 
                borderRadius: '8px', 
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <span style={{ color: 'var(--color-primary)' }}>✦</span>
              <span>{topic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Detailed Question Review List */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-bright)', margin: '0 0 20px 0' }}>
          Question-by-Question Review
        </h3>
        <div className="questions-list">
          {details && details.map((detail, idx) => (
            <div 
              key={idx} 
              className="question-card" 
              style={{
                borderColor: detail.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                backgroundColor: detail.isCorrect ? 'rgba(16, 185, 129, 0.01)' : 'rgba(239, 68, 68, 0.01)'
              }}
              id={`review-card-${idx}`}
            >
              <div className="question-card-header">
                <span className="question-number" style={{ color: detail.isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  Question {idx + 1} — {detail.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
                <span className={`badge ${detail.isCorrect ? 'badge-easy' : 'badge-hard'}`}>
                  {detail.isCorrect ? '✓ Match' : '✗ Mistake'}
                </span>
              </div>

              <p className="question-text" style={{ fontSize: '14px', marginBottom: '16px' }}>{detail.question}</p>

              {/* Answers comparative layout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(9, 13, 22, 0.4)', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Your Answer: </span>
                  <strong style={{ color: detail.isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {detail.userAnswer || '(No answer provided)'}
                  </strong>
                </div>
                {!detail.isCorrect && (
                  <div style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Correct Answer: </span>
                    <strong style={{ color: 'var(--color-success)' }}>{detail.correctAnswer}</strong>
                  </div>
                )}
              </div>

              {detail.explanation && (
                <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.01)', borderLeft: '3px solid var(--color-primary)', fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <strong>Explanation:</strong> {detail.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

// Footer controls
      <div className="form-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
        <button className="btn btn-primary" onClick={onRestart} id="btn-retake-quiz">
          Retake Assessment
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            const reconstructedQuiz = {
              title: "Assessment Report",
              questions: details.map(d => ({
                question: d.question,
                type: d.type,
                correctAnswer: d.correctAnswer,
                explanation: d.explanation
              }))
            };
            const { exportToCSV } = require('../../utils/exportUtils');
            exportToCSV(reconstructedQuiz, result);
          }} 
          id="btn-export-csv"
        >
          Export CSV
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            const { triggerPDFPrint } = require('../../utils/exportUtils');
            triggerPDFPrint();
          }} 
          id="btn-export-pdf"
        >
          Export PDF
        </button>
        <button className="btn btn-secondary" onClick={onBack} id="btn-back-generator" style={{ marginLeft: 'auto' }}>
          Back to Generator
        </button>
      </div>

    </div>
  );
};

export default QuizResult;
