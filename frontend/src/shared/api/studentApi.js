import { apiClient } from './client';

export const studentApi = {
  getCases: async () => {
    const res = await apiClient.get('/student/cases');
    return res.data;
  },
  getCaseById: async (id) => {
    const res = await apiClient.get(`/student/cases/${id}`);
    return res.data;
  },
  createCase: async (data) => {
    // data: { institutionId, rawInstitutionName, rawState, category, description, evidenceFiles }
    const res = await apiClient.post('/student/cases', data);
    return res.data;
  },
  replyCase: async (id, data) => {
    // data: { message, attachments }
    const res = await apiClient.post(`/student/cases/${id}/reply`, data);
    return res.data;
  },
  getNotifications: async () => {
    const res = await apiClient.get('/student/notifications');
    return res.data;
  },
  markNotificationRead: async (id) => {
    const res = await apiClient.post(`/student/notifications/${id}/read`);
    return res.data;
  },
  getInstitutions: async (params = {}) => {
    const res = await apiClient.get('/student/institutions', { params });
    return res.data;
  },
};

export default studentApi;
