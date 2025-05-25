const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events.controller");

router.get("/", eventsController.getAllEvents);
router.get("/:id", eventsController.getEventById);
router.post("/", eventsController.createEvent);
router.delete("/:id", eventsController.deleteEvent);

module.exports = router;