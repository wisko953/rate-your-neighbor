import { apiMetier } from '../../services/api';

// Service pour les foyers (houses)
export const houseService = {
  create: async (houseData) => {
    const response = await apiMetier.post('/neighbors/houses', houseData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/houses');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/houses/${id}`);
    return response.data;
  },

  update: async (id, houseData) => {
    const response = await apiMetier.put(`/neighbors/houses/${id}`, houseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/houses/${id}`);
    return response.data;
  },

  getOccupants: async (id) => {
    const response = await apiMetier.get(`/neighbors/houses/${id}/occupants`);
    return response.data;
  },

  getScore: async (id) => {
    const response = await apiMetier.get(`/neighbors/houses/${id}/score`);
    return response.data;
  },

  getComplianceStatus: async (id) => {
    const response = await apiMetier.get(`/neighbors/houses/${id}/compliance`);
    return response.data;
  }
};

export default houseService;