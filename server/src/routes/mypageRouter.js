const express = require("express");
const db = require("../models/meetingly_db");
const controller = require("../controllers/mypageController");
const router = express.Router();

router.get("/check-nickname", controller.validateNickname);
router.get("/team-data", controller.getTeamInfo);
router.put("/update-nickname", controller.updateNickname);
router.post("/leave-team", controller.leaveTeam);
router.post("/leave-meetingly", controller.leaveMeetingly);

module.exports = router;
