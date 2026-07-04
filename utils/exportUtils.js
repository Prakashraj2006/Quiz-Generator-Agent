/**
 * Client-Side Exporter Utilities for Quizzes and Results
 */

/**
 * Generates and downloads a CSV document of the quiz questions, answers, and evaluation.
 */
export const exportToCSV = (quiz, result) => {
  if (!quiz) return;

  const headers = ['Question Number', 'Question Prompt', 'Question Type', 'Options', 'User Answer', 'Correct Answer', 'Status', 'Explanation'];
  const rows = [headers];

  const questions = quiz.questions || [];
  const details = result ? result.details : null;

  questions.forEach((q, idx) => {
    const detail = details ? details[idx] : null;
    
    const number = idx + 1;
    const prompt = q.question.replace(/"/g, '""'); // Escape double quotes
    const type = q.type;
    const options = q.options ? q.options.join(' | ').replace(/"/g, '""') : '';
    const userAns = detail ? (detail.userAnswer || '').replace(/"/g, '""') : '';
    const correctAns = q.correctAnswer.replace(/"/g, '""');
    
    let status = 'Not Taken';
    if (detail) {
      status = detail.isCorrect ? 'Correct' : 'Incorrect';
    }

    const explanation = (q.explanation || '').replace(/"/g, '""');

    rows.push([
      `"${number}"`,
      `"${prompt}"`,
      `"${type}"`,
      `"${options}"`,
      `"${userAns}"`,
      `"${correctAns}"`,
      `"${status}"`,
      `"${explanation}"`
    ]);
  };

  const csvContent = "data:text/csv;charset=utf-8," 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  
  const cleanTitle = quiz.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute("download", `${cleanTitle}_review.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers browser print window.
 * Print CSS layouts inside components/quiz/quizStyles.css optimize pages automatically.
 */
export const triggerPDFPrint = () => {
  window.print();
};
