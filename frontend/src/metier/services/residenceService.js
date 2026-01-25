import { apiMetier } from '../../services/api';

// Service pour les résidences
export const residenceService = {
  create: async (residenceData) => {
    const response = await apiMetier.post('/residences', residenceData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/residences');
    return response.data;
  },

  getById: async (id) => {
    const list = await residenceService.getAll();
    return list.find((r) => r.id === id) || null;
  },

  update: async (id, residenceData) => {
    throw new Error('Mise à jour de résidence non supportée par l’API');
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/residences/${id}`);
    return response.data;
  },

  getLeaderboard: async (id) => {
    const response = await apiMetier.get(`/residences/${id}/leaderboard`);
    return response.data;
  },

  getHouses: async (id) => {
    const { data } = await apiMetier.get('/houses');
    return data.filter((h) => h.residence_id === id);
  }
};

export default residenceService;