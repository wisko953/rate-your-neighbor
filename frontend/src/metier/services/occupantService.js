import { apiMetier } from '../../services/api';

// Service pour les occupants
export const occupantService = {
  create: async (occupantData) => {
    const response = await apiMetier.post('/occupants', occupantData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/occupants');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/occupants/${id}`);
    return response.data;
  },

  update: async (id, occupantData) => {
    const response = await apiMetier.patch(`/occupants/${id}`, occupantData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/occupants/${id}`);
    return response.data;
  },

  getReviews: async (id) => {
    const { data } = await apiMetier.get('/reviews');
    return data.filter((r) => r.target_occupant_id === id);
  },

  getScore: async (id) => {
    const occ = await occupantService.getById(id);
    return occ?.score ?? null;
  },

  postReview: async (targetOccupantId, reviewData) => {
    const payload = { ...reviewData, target_occupant_id: targetOccupantId };
    const response = await apiMetier.post(`/reviews`, payload);
    return response.data;
  }
};

export default occupantService;