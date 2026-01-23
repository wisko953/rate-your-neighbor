import { apiMetier } from '../../services/api';

// Service pour les utilisateurs
export const userService = {
  create: async (userData) => {
    const response = await apiMetier.post('/neighbors/users', userData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/users');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await apiMetier.put(`/neighbors/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/users/${id}`);
    return response.data;
  },

  getManagedHouses: async (userId) => {
    const response = await apiMetier.get(`/neighbors/users/${userId}/houses`);
    return response.data;
  },

  getSubmittedReviews: async (userId) => {
    const response = await apiMetier.get(`/neighbors/users/${userId}/reviews`);
    return response.data;
  },

  getSubmittedReports: async (userId) => {
    const response = await apiMetier.get(`/neighbors/users/${userId}/reports`);
    return response.data;
  },

  isAdmin: async (userId) => {
    const response = await apiMetier.get(`/neighbors/users/${userId}/admin-status`);
    return response.data;
  }
};

export default userService;