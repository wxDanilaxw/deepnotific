const Event = require('../models/Event');
const { validationResult } = require('express-validator');

module.exports = {
  getAllEvents: async (req, res, next) => {
    try {
      const events = await Event.getAll();
      res.json(events);
    } catch (err) {
      next(err);
    }
  },

  getEventById: async (req, res, next) => {
    try {
      const event = await Event.getById(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (err) {
      next(err);
    }
  },

  createEvent: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const eventId = await Event.create(req.body);
      res.status(201).json({ 
        message: 'Event created successfully',
        id: eventId
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ 
          error: 'Event with this name and time already exists' 
        });
      }
      next(err);
    }
  },

  updateEvent: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updated = await Event.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event updated successfully' });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ 
          error: 'Event with this name and time already exists' 
        });
      }
      next(err);
    }
  },

  deleteEvent: async (req, res, next) => {
    try {
      const deleted = await Event.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};