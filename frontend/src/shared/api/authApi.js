import { apiClient } from './client';

export const authApi = {
  login: async ({ email, password, portal }) => {
    const response = await apiClient.post('/auth/login', { email, password, portal });
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get('/me');
    return response.data;
  },
};

export default authApi;
