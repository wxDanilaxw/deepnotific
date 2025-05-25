const Event = require("../models/Event");

module.exports = {
  getAllEvents: async (req, res) => {
    try {
      const events = await Event.getAll();
      res.json(events);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  getEventById: async (req, res) => {
    try {
      const event = await Event.getById(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  createEvent: async (req, res) => {
    try {
      const eventId = await Event.create(req.body);
      res.status(201).json({ id: eventId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const deleted = await Event.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Event not found" });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
};