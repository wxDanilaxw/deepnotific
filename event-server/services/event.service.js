const Event = require("../models/Event");

module.exports = {
  createEvent: async (eventData) => {
    if (eventData.user_role !== "admin") {
      throw new Error("Forbidden: Admin role required");
    }
    return await Event.create(eventData);
  },

  getEvents: async (eventDate = null) => {
    return await Event.getAll(eventDate);
  },

  getEventById: async (id) => {
    const event = await Event.getById(id);
    if (!event) throw new Error("Event not found");
    return event;
  },

  deleteEvent: async (id, userRole) => {
    if (userRole !== "admin") {
      throw new Error("Forbidden: Admin role required");
    }
    return await Event.delete(id);
  },
};
