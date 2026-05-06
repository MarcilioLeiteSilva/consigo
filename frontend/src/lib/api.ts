// Updated: 2026-05-06 19:17
import axios from 'axios';

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'https://consigo-backend-consigo.xc4mw1.easypanel.host';
// Limpeza automática para remover o prefixo 'api.' caso o Easypanel injete errado
const sanitizedBaseURL = rawBaseURL.replace('https://api.consigo', 'https://consigo');

const api = axios.create({
  baseURL: sanitizedBaseURL,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${sanitizedBaseURL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
