import { apiMetier } from '../../services/api';

// Service pour les utilisateurs
export const userService = {
  create: async (userData) => {
    const response = await apiMetier.post('/users', userData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/users');
    return response.data;
  },

  getById: async (id) => {
    const list = await userService.getAll();
    return list.find((u) => u.id === id) || null;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/users/${id}`);
    return response.data;
  },

  getManagedHouses: async (userId) => {
    const { data } = await apiMetier.get('/houses');
    return data.filter((h) => h.referent_user_id === userId);
  },

  getSubmittedReviews: async (userId) => {
    const { data } = await apiMetier.get('/reviews');
    return data.filter((r) => r.submitter_user_id === userId);
  },

  getSubmittedReports: async (userId) => {
    const { data } = await apiMetier.get('/reports');
    return data.filter((r) => r.author_user_id === userId);
  },

  isAdmin: async (userId) => {
    const user = await userService.getById(userId);
    return !!user?.is_admin;
  },

  approveExpulsion: async (userId, houseId) => {
    const response = await apiMetier.post(`/users/${userId}/approve-expulsion`, { houseId });
    return response.data;
  }
};

export default userService;