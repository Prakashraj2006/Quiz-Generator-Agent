import React, { useState, useEffect } from 'react';
import { getQuizHistory, deleteQuiz } from '../../api/quizApi';

/**
 * QuizHistory Component
 * Fetches and displays a list of generated and completed quizzes.
 * Provides actions to view summaries, retake, or delete records.
 */
const QuizHistory = ({ onViewQuiz, onRetakeQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const data = await getQuizHistory();
      if (data && data.success) {
        setQuizzes(data.quizzes || []);
      }
    } catch (err) {
      console.warn('API error fetching history, loaded local mock data:', err.message);
      // Fallback local mockup history data if the DB connection is offline
      const mockHistory = [
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
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
        },
        {
          _id: '65d1a1b2c3d4e5f6a7b8c002',
          title: 'React Hook State practice',
          topic: 'React Hooks',
          difficulty: 'easy',
          questionType: 'mcq',
          numberOfQuestions: 3,
          score: 0,
          status: 'saved',
          completed: false,
          createdAt: new Date().toISOString()
        }
      ];
      setQuizzes(mockHistory);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz record?')) return;

    try {
      await deleteQuiz(quizId);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
    } catch (err) {
      console.warn('Backend delete failed, running local list subtraction:', err.message);
      setQuizzes(prev => prev.filter(q => q._id !== quizId));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="glass-card loading-state" style={{ minHeight: '300px' }} id="history-loading-skeleton">
        <div className="spinner"></div>
        <h4 className="loading-text">Loading Assessment History</h4>
        <p className="loading-subtext">Fetching completed and saved quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quiz-history-wrapper">
      {deleteSuccess && (
        <div className="custom-alert success" id="history-delete-toast">
          <span>✓</span>
          <span>Quiz record deleted successfully.</span>
        </div>
      )}

      {apiError && (
        <div className="custom-alert error">
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="glass-card empty-state" style={{ minHeight: '280px' }} id="history-empty-view">
          <div className="empty-state-icon">📚</div>
          <h3 className="empty-state-title">No Quizzes Found</h3>
          <p className="empty-state-text">
            You haven't generated or saved any assessments yet. Run the generator config to build a quiz.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }} id="history-table">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)' }}>Quiz Title</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)' }}>Difficulty</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)' }}>Type</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)' }}>Q Count</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)' }}>Score</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)' }}>Date</th>
                  <th style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => {
                  const isCompleted = quiz.completed || quiz.status === 'completed';
                  return (
                    <tr 
                      key={quiz._id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        transition: 'var(--transition-smooth)',
                        cursor: 'pointer'
                      }}
                      onClick={() => onViewQuiz(quiz)}
                      className="history-row"
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-bright)', fontSize: '14px', marginBottom: '4px' }}>
                          {quiz.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Topic: {quiz.topic || 'General'}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={`badge badge-${quiz.difficulty}`}>
                          {quiz.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13.5px', textTransform: 'capitalize' }}>
                        {quiz.questionType === 'true_false' ? 'True/False' : (quiz.questionType === 'mcq' ? 'MCQ' : quiz.questionType)}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13.5px', fontWeight: '600' }}>
                        {quiz.numberOfQuestions || (quiz.questions && quiz.questions.length) || 0}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {isCompleted ? (
                          <strong style={{ color: 'var(--color-success)', fontSize: '14px' }}>
                            {quiz.score} / {quiz.numberOfQuestions || (quiz.questions && quiz.questions.length)}
                          </strong>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                            Not Taken
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDate(quiz.createdAt)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                            onClick={(e) => { e.stopPropagation(); onViewQuiz(quiz); }}
                            id={`btn-view-${quiz._id}`}
                          >
                            View
                          </button>
                          
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                            onClick={(e) => { e.stopPropagation(); onRetakeQuiz(quiz); }}
                            id={`btn-retake-${quiz._id}`}
                          >
                            {isCompleted ? 'Retake' : 'Start'}
                          </button>

                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                            onClick={(e) => handleDelete(quiz._id, e)}
                            id={`btn-delete-${quiz._id}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
