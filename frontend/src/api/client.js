import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const linksApi = {
  // Get all links
  getAll: () => api.get('/links'),
  
  // Get single link by code
  getByCode: (code) => api.get(`/links/${code}`),
  
  // Create new link
  create: (data) => api.post('/links', data),
  
  // Delete link
  delete: (code) => api.delete(`/links/${code}`),
};

export default api;