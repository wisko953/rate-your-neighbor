import { apiMetier } from '../../services/api';

// Service pour les événements
export const eventService = {
  create: async (eventData) => {
    const response = await apiMetier.post('/neighbors/events', eventData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/neighbors/events');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiMetier.get(`/neighbors/events/${id}`);
    return response.data;
  },

  update: async (id, eventData) => {
    const response = await apiMetier.put(`/neighbors/events/${id}`, eventData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/neighbors/events/${id}`);
    return response.data;
  },

  getParticipants: async (eventId) => {
    const response = await apiMetier.get(`/neighbors/events/${eventId}/participants`);
    return response.data;
  },
};

export default eventService;