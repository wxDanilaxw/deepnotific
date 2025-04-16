const express = require("express");
const eventsController = require("../controllers/events");

const router = express.Router();

router.get("/", eventsController.getAll);
router.get("/:id", eventsController.getById);
router.post("/", eventsController.create);
router.delete("/:id", eventsController.delete);

module.exports = router;
