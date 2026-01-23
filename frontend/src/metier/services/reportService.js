import { apiMetier } from '../../services/api';

// Service pour les signalements
export const reportService = {
  create: async (reportData) => {
    const response = await apiMetier.post('/neighbors/reports', reportData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/reports');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/reports/${id}`);
    return response.data;
  },

  update: async (id, reportData) => {
    const response = await apiMetier.put(`/neighbors/reports/${id}`, reportData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/reports/${id}`);
    return response.data;
  },

  getByTargetOccupant: async (occupantId) => {
    const response = await apiMetier.get(`/neighbors/occupants/${occupantId}/reports`);
    return response.data;
  },

  getByAuthor: async (userId) => {
    const response = await apiMetier.get(`/neighbors/users/${userId}/reports`);
    return response.data;
  },

  markAsProcessed: async (id) => {
    const response = await apiMetier.patch(`/neighbors/reports/${id}/process`);
    return response.data;
  },

  getUnprocessed: async () => {
    const response = await apiMetier.get('/neighbors/reports/unprocessed');
    return response.data;
  }
};

export default reportService;