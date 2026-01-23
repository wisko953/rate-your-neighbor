import { apiMetier } from '../../services/api';

// Service pour les occupants
export const occupantService = {
  create: async (occupantData) => {
    const response = await apiMetier.post('/neighbors/occupants', occupantData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/occupants');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/occupants/${id}`);
    return response.data;
  },

  update: async (id, occupantData) => {
    const response = await apiMetier.put(`/neighbors/occupants/${id}`, occupantData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/occupants/${id}`);
    return response.data;
  },

  getReviews: async (id) => {
    const response = await apiMetier.get(`/neighbors/occupants/${id}/reviews`);
    return response.data;
  },

  getScore: async (id) => {
    const response = await apiMetier.get(`/neighbors/occupants/${id}/score`);
    return response.data;
  },

  postReview: async (targetOccupantId, reviewData) => {
    const response = await apiMetier.post(`/neighbors/occupants/${targetOccupantId}/reviews`, reviewData);
    return response.data;
  }
};

export default occupantService;