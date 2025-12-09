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
    
    // If the data is FormData, let axios set the Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
  
  create: (projectData) => {
    if (projectData instanceof FormData) {
      return api.post('/projects', projectData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/projects', projectData);
  },
  
  update: (id, projectData) => {
    if (projectData instanceof FormData) {
      return api.put(`/projects/${id}`, projectData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/projects/${id}`, projectData);
  },
  
  delete: (id) => api.delete(`/projects/${id}`),
  requestJoin: (id, message) => api.post(`/projects/${id}/join`, { message }),
  addComment: (id, text) => api.post(`/projects/${id}/comments`, { text }),
  toggleLike: (id) => api.post(`/projects/${id}/like`),
  incrementView: (id) => api.post(`/projects/${id}/view`),
  uploadImage: (id, formData) => api.post(`/projects/${id}/image`, formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
};

export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (formData) => api.put('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleFollow: (id) => api.post(`/users/${id}/follow`),
  toggleSave: (projectId) => api.post(`/users/save/${projectId}`),
  getSavedProjects: () => api.get('/users/saved/projects'),
  endorseSkill: (id, skill) => api.post(`/users/${id}/endorse`, { skill }),
  searchUsers: (params) => api.get('/users/search', { params }),
  
  // Notifications
  getNotifications: () => api.get('/users/notifications/all'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/users/notifications/read-all'),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/conversation/${userId}`),
  sendMessage: (userId, content) => api.post(`/messages/send/${userId}`, { content }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const teamPostAPI = {
  getAll: (params) => api.get('/team-posts', { params }),
  getOne: (id) => api.get(`/team-posts/${id}`),
  create: (data) => api.post('/team-posts', data),
  update: (id, data) => api.put(`/team-posts/${id}`, data),
  delete: (id) => api.delete(`/team-posts/${id}`),
  apply: (id, message) => api.post(`/team-posts/${id}/apply`, { message }),
  updateApplication: (id, applicationId, status) => 
    api.put(`/team-posts/${id}/application/${applicationId}`, { status }),
  toggleLike: (id) => api.post(`/team-posts/${id}/like`),
};

export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getOne: (id) => api.get(`/teams/${id}`),
  create: (teamData) => api.post('/teams', teamData),
  apply: (id, message) => api.post(`/teams/${id}/apply`, { message }),
};

export default api;
