const express = require("express");
const db = require("../models/db_users");
const controller = require("../controllers/mypageController");
const router = express.Router();

router.get("/check-nickname", controller.validateNickname);
router.put("/update-nickname", controller.updateNickname);
router.post("/leave-team", controller.leaveTeam);

module.exports = router;
