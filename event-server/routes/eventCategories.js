const express = require("express");
const router = express.Router();
const eventCategoriesController = require("../controllers/eventCategories");

router.get("/", eventCategoriesController.getAll);

module.exports = router;