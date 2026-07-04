import axiosInstance from './axios';

/**
 * Quiz Generator Agent API Client
 */
export const generateQuiz = async (quizConfig) => {
  const response = await axiosInstance.post('/quiz/generate', quizConfig);
  return response.data;
};

export const saveQuiz = async (quizData) => {
  const response = await axiosInstance.post('/quiz/save', quizData);
  return response.data;
};

export const getQuizHistory = async () => {
  const response = await axiosInstance.get('/quiz/history');
  return response.data;
};

export const getQuizById = async (quizId) => {
  const response = await axiosInstance.get(`/quiz/${quizId}`);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await axiosInstance.delete(`/quiz/${quizId}`);
  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await axiosInstance.post(`/quiz/${quizId}/submit`, { answers });
  return response.data;
};
