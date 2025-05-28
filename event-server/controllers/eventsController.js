const Event = require("../models/Event");

module.exports = {
  getAllEvents: async (req, res) => {
    try {
      console.log('Fetching all events');
      const events = await Event.getAll();
      res.json(events);
    } catch (err) {
      console.error('Error in getAllEvents:', err);
      res.status(500).json({ error: err.message });
    }
  },

  createEvent: async (req, res) => {
    try {
      console.log('Creating event with data:', req.body);
      const eventId = await Event.create(req.body);
      res.json({ 
        success: true,
        id: eventId
      });
    } catch (err) {
      console.error('Error in createEvent:', err);
      res.status(500).json({ 
        error: err.message,
        details: err.detail // Для PostgreSQL ошибок
      });
    }
  },

  updateEvent: async (req, res) => {
    try {
      console.log(`Updating event ${req.params.id} with:`, req.body);
      const updated = await Event.update(req.params.id, req.body);
      res.json({ 
        success: true,
        updated
      });
    } catch (err) {
      console.error('Error in updateEvent:', err);
      res.status(500).json({ 
        error: err.message,
        details: err.detail
      });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      console.log(`Deleting event ${req.params.id}`);
      const deleted = await Event.delete(req.params.id);
      res.json({ 
        success: true,
        deleted
      });
    } catch (err) {
      console.error('Error in deleteEvent:', err);
      res.status(500).json({ 
        error: err.message,
        details: err.detail
      });
    }
  }

  
};

