const Event = require("../models/Event");

module.exports = {
  async getAll(req, res) {
    try {
      const events = await Event.getAll(req.query.event_date);
      res.json(events);
    } catch (err) {
      console.error("Error fetching events:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async getById(req, res) {
    try {
      const event = await Event.getById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (err) {
      console.error("Error fetching e       vent:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async create(req, res) {
    if (req.body.user_role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied: User is not an admin" });
    }

    try {
      const eventId = await Event.create(req.body);
      res.status(201).json({ message: "Event created successfully", eventId });
    } catch (err) {
      console.error("Error creating event:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  async delete(req, res) {
    if (req.body.user_role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied: User is not an admin" });
    }

    try {
      const event = await Event.delete(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ message: "Event deleted", event });
    } catch (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
