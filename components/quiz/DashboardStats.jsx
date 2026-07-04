import React from 'react';

/**
 * DashboardStats Component
 * Renders the dashboard metrics overview (Total Quizzes, Completed, Avg Score, Best/Weakest Topics)
 * and displays recent quiz history with direct quick actions.
 */
const DashboardStats = ({ quizzes, onCreateClick, onViewQuiz, onRetakeQuiz }) => {
  
  // Calculate stats dynamically from quizzes list
  const totalCount = quizzes.length;
  const completedQuizzes = quizzes.filter(q => q.completed || q.status === 'completed');
  const completedCount = completedQuizzes.length;
  
  // Calculate average score percentage
  let avgScorePercent = 0;
  if (completedCount > 0) {
    const totalPercent = completedQuizzes.reduce((sum, q) => {
      const qCount = q.numberOfQuestions || 5;
      const score = q.score || 0;
      return sum + (score / qCount) * 100;
    }, 0);
    avgScorePercent = Math.round(totalPercent / completedCount);
  }

  // Calculate best/weakest topics
  // Map topics to their scores
  const topicStats = {};
  completedQuizzes.forEach(q => {
    const topic = q.topic || 'General';
    const score = q.score || 0;
    const count = q.numberOfQuestions || 5;
    const ratio = score / count;
    
    if (!topicStats[topic]) {
      topicStats[topic] = { totalRatio: 0, count: 0 };
    }
    topicStats[topic].totalRatio += ratio;
    topicStats[topic].count += 1;
  });

  let bestTopic = 'N/A';
  let weakestTopic = 'N/A';
  let maxRatio = -1;
  let minRatio = 2;

  Object.keys(topicStats).forEach(topic => {
    const avgRatio = topicStats[topic].totalRatio / topicStats[topic].count;
    if (avgRatio > maxRatio) {
      maxRatio = avgRatio;
      bestTopic = topic;
    }
    if (avgRatio < minRatio) {
      minRatio = avgRatio;
      weakestTopic = topic;
    }
  });

  // Recent 4 quizzes
  const recentQuizzes = quizzes.slice(0, 4);

  return (
    <div className="dashboard-stats-wrapper">
      
      {/* 1. Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }} id="stats-grid">
        
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Quizzes</span>
          <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-bright)' }}>{totalCount}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Created templates</span>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Completed Quizzes</span>
          <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-success)' }}>{completedCount}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Grades generated</span>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Average Score</span>
          <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-primary)' }}>{avgScorePercent}%</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Correct answers ratio</span>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Subject Analysis</span>
          <div style={{ fontSize: '13px', color: 'var(--text-bright)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            🏆 Best: <strong style={{ color: 'var(--color-success)' }}>{bestTopic}</strong>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-bright)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            ⚠️ Weak: <strong style={{ color: 'var(--color-danger)' }}>{weakestTopic}</strong>
          </div>
        </div>

      </div>

      <div className="quiz-grid-layout" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        
        {/* 2. Recent Quizzes Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-bright)', margin: '0 0 16px 0' }}>
            Recent Quiz Attempts
          </h3>
          {recentQuizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              No recent attempts. Generate a quiz to see it here!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} id="recent-attempts-list">
              {recentQuizzes.map((quiz) => {
                const isCompleted = quiz.completed || quiz.status === 'completed';
                return (
                  <div 
                    key={quiz._id} 
                    style={{ 
                      padding: '14px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      backgroundColor: 'rgba(255,255,255,0.015)' 
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-bright)' }}>{quiz.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Topic: {quiz.topic || 'General'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '600' }}>
                        {isCompleted ? (
                          <span style={{ color: 'var(--color-success)' }}>{quiz.score} Correct</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Saved</span>
                        )}
                      </span>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                        onClick={() => isCompleted ? onViewQuiz(quiz) : onRetakeQuiz(quiz)}
                      >
                        {isCompleted ? 'Review' : 'Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Quick Actions Callout */}
        <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
          <span style={{ fontSize: '32px' }}>🤖</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-bright)', margin: '0' }}>
            Quiz Generator Agent
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0', lineHeight: '1.5' }}>
            Generate practice tests dynamically from topics, paste raw notes, or launch assessments from repository tech stacks to trace performance metrics automatically.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ width: 'fit-content', marginTop: '8px' }}
            onClick={onCreateClick}
            id="btn-create-dashboard-cta"
          >
            Create Practice Quiz
          </button>
        </div>

      </div>

    </div>
  );
};

export default DashboardStats;
