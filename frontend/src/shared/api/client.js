import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Detects the active portal based on the request URL and/or browser location
 * @param {string} url - The request endpoint URL
 * @returns {'officer' | 'bureau' | 'student'}
 */
export const detectPortal = (url = '') => {
  const cleanUrl = (url || '').toLowerCase();
  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';

  if (cleanUrl.includes('/officer') || pathname.startsWith('/officer')) return 'officer';
  if (cleanUrl.includes('/bureau') || pathname.startsWith('/bureau')) return 'bureau';
  if (cleanUrl.includes('/student') || pathname.startsWith('/student')) return 'student';

  // Fallback: check which token exists
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('officer_token')) return 'officer';
    if (localStorage.getItem('bureau_token')) return 'bureau';
    if (localStorage.getItem('student_token')) return 'student';
  }

  return 'officer';
};

// Request interceptor: attach token by active portal
apiClient.interceptors.request.use(
  (config) => {
    const portal = detectPortal(config.url);
    const tokenKey = `${portal}_token`;
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, redirect to that portal's own login, not global /login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const portal = detectPortal(error.config?.url);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`${portal}_token`);
        localStorage.removeItem(`${portal}_user`);
      }

      const targetLogin = `/${portal}/login`;
      if (typeof window !== 'undefined' && window.location.pathname !== targetLogin) {
        window.location.href = targetLogin;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
