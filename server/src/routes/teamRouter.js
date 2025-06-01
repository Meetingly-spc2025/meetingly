const express = require("express");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
const controller = require("../controllers/teamController");

router.get("/:teamId/members", controller.teamList);
router.post("/create", controller.createTeam);
router.post("/join", controller.joinTeam);

module.exports = router;
