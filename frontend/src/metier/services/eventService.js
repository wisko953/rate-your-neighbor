import { apiMetier } from '../../services/api';

// Service pour les événements
export const eventService = {
  create: async (eventData) => {
    const response = await apiMetier.post('/events', eventData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiMetier.get('/events');
    return response.data;
  },

  getById: async (id) => {
    const list = await eventService.getAll();
    return list.find((e) => e.id === id) || null;
  },

  update: async (id, eventData) => {
    const response = await apiMetier.patch(`/events/${id}`, eventData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiMetier.delete(`/events/${id}`);
    return response.data;
  },

  register: async (eventId, occupant_id) => {
    const response = await apiMetier.post(`/events/${eventId}/register`, { occupant_id });
    return response.data;
  },
};

export default eventService;