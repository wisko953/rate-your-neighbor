import { apiMetier } from '../../services/api';

// Service pour les résidences
export const residenceService = {
  create: async (residenceData) => {
    const response = await apiMetier.post('/neighbors/residences', residenceData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/residences');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/residences/${id}`);
    return response.data;
  },

  update: async (id, residenceData) => {
    const response = await apiMetier.put(`/neighbors/residences/${id}`, residenceData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/residences/${id}`);
    return response.data;
  },

  getLeaderboard: async (id) => {
    const response = await apiMetier.get(`/neighbors/residences/${id}/leaderboard`);
    return response.data;
  },

  getHouses: async (id) => {
    const response = await apiMetier.get(`/neighbors/residences/${id}/houses`);
    return response.data;
  }
};

export default residenceService;