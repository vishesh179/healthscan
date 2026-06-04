import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadReport = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const analyzeReport = async (reportId) => {
  const response = await api.post('/analyze', { report_id: reportId });
  return response.data;
};

export const getReport = async (reportId) => {
  const response = await api.get(`/report/${reportId}`);
  return response.data;
};

export const sendChatMessage = async (reportId, message) => {
  const response = await api.post('/chat', {
    report_id: reportId,
    message,
  });
  return response.data;
};

export default api;
