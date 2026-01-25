import { apiMetier } from '../../services/api';

// Service pour les signalements
export const reportService = {
  create: async (reportData) => {
    const response = await apiMetier.post('/reports', reportData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/reports');
    return response.data;
  },

  getById: async (id) => {
    const list = await reportService.getAll();
    return list.find((r) => r.id === id) || null;
  },

  update: async (id, reportData) => {
    const response = await apiMetier.patch(`/reports/${id}`, reportData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/reports/${id}`);
    return response.data;
  },

  getByTargetOccupant: async (occupantId) => {
    const list = await reportService.getAll();
    return list.filter((r) => r.target_occupant_id === occupantId);
  },

  getByAuthor: async (userId) => {
    const list = await reportService.getAll();
    return list.filter((r) => r.author_user_id === userId);
  },

  markAsProcessed: async (id) => {
    const response = await apiMetier.patch(`/reports/${id}`, { is_processed: true });
    return response.data;
  },

  getUnprocessed: async () => {
    const list = await reportService.getAll();
    return list.filter((r) => !r.is_processed);
  }
};

export default reportService;