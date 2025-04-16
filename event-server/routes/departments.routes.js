const express = require("express");
const router = express.Router();
const departmentsController = require("../controllers/departments");

router.get("/", departmentsController.getAll);

module.exports = router;
