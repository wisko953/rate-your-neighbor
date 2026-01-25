import { apiMetier } from '../../services/api';

// Service pour les foyers (houses)
export const houseService = {
  create: async (houseData) => {
    const response = await apiMetier.post('/houses', houseData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/houses');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/houses/${id}`);
    return response.data;
  },

  update: async (id, houseData) => {
    const response = await apiMetier.patch(`/houses/${id}`, houseData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/houses/${id}`);
    return response.data;
  },

  getOccupants: async (id) => {
    const { data } = await apiMetier.get('/occupants');
    return data.filter((o) => o.house_id === id);
  },

  getScore: async (id) => {
    const house = await houseService.getById(id);
    return house?.currentScore ?? null;
  },

  getComplianceStatus: async (id) => {
    const house = await houseService.getById(id);
    return house?.status ?? null;
  }
};

export default houseService;