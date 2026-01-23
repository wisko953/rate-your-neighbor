import { apiMetier } from '../../services/api';

// Service pour les avis (reviews)
export const reviewService = {
  create: async (reviewData) => {
    const response = await apiMetier.post('/neighbors/reviews', reviewData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/reviews');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/reviews/${id}`);
    return response.data;
  },

  update: async (id, reviewData) => {
    const response = await apiMetier.put(`/neighbors/reviews/${id}`, reviewData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/reviews/${id}`);
    return response.data;
  },

  getByTargetOccupant: async (occupantId) => {
    const response = await apiMetier.get(`/neighbors/occupants/${occupantId}/reviews`);
    return response.data;
  },

  getBySubmitter: async (userId) => {
    const response = await apiMetier.get(`/neighbors/users/${userId}/reviews`);
    return response.data;
  },

  validateRating: (rating) => {
    return rating >= 0 && rating <= 5;
  }
};

export default reviewService;