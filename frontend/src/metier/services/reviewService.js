import { apiMetier } from '../../services/api';

// Service pour les avis (reviews)
export const reviewService = {
  create: async (reviewData) => {
    const response = await apiMetier.post('/reviews', reviewData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/reviews');
    return response.data;
  },

  getById: async (id) => {
    const list = await reviewService.getAll();
    return list.find((r) => r.id === id) || null;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/reviews/${id}`);
    return response.data;
  },

  getByTargetOccupant: async (occupantId) => {
    const list = await reviewService.getAll();
    return list.filter((r) => r.target_occupant_id === occupantId);
  },

  getBySubmitter: async (userId) => {
    const list = await reviewService.getAll();
    return list.filter((r) => r.submitter_user_id === userId);
  },

  validateRating: (rating) => {
    return rating >= 0 && rating <= 5;
  }
};

export default reviewService;