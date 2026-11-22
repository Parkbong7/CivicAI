import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Auth
  login: (payload) => apiClient.post('/api/auth/login', payload),
  register: (payload) => apiClient.post('/api/auth/register', payload),
  ssoDigilocker: () => apiClient.post('/api/auth/sso-digilocker'),

  // Documents OCR
  ocrSampleDocument: (payload) => apiClient.post('/api/documents/ocr-sample', payload),
  ocrUploadDocument: (formData) => apiClient.post('/api/documents/ocr-upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Health
  checkHealth: () => apiClient.get('/api/health'),

  // Services Catalog
  getServices: (category) => apiClient.get('/api/services', { params: { category } }),
  getServiceDetail: (id) => apiClient.get(`/api/services/${id}`),
  discoverPortal: (portal_url) => apiClient.post('/api/services/discover', null, { params: { portal_url } }),

  // Chat
  sendMessage: (payload) => apiClient.post('/api/chat', payload),
  sendVoiceAudio: (formData) => apiClient.post('/api/chat/voice', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Automation
  startDemoAutomation: (payload) => apiClient.post('/api/automation/start-demo', payload),
  getAutomationStatus: (sessionId = 'sess_demo') => apiClient.get('/api/automation/status', { params: { session_id: sessionId } }),
  approveAndSubmit: (payload) => apiClient.post('/api/automation/approve-submit', payload),

  // Applications
  getApplications: () => apiClient.get('/api/applications'),
  getApplication: (id) => apiClient.get(`/api/applications/${id}`),
  createApplication: (payload) => apiClient.post('/api/applications', payload),
  exportPdf: (payload) => apiClient.post('/api/applications/export-pdf', payload, { responseType: 'blob' }),
};

export default api;
