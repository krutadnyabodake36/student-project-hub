import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  requestJoin: (id, message) => api.post(`/projects/${id}/request`, { message }),
  addComment: (id, text) => api.post(`/projects/${id}/comment`, { text }),
  toggleLike: (id) => api.post(`/projects/${id}/like`),
  incrementView: (id) => api.post(`/projects/${id}/view`),
  uploadImage: (id, formData) => api.post(`/projects/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getOne: (id) => api.get(`/teams/${id}`),
  create: (teamData) => api.post('/teams', teamData),
  apply: (id, message) => api.post(`/teams/${id}/apply`, { message }),
};

export default api;
