const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");

router.post("/", meetingController.createMeeting);
router.patch("/end", meetingController.endMeeting);
router.get("/:meeting_id", meetingController.getMeeting);
router.post("/participants", meetingController.addParticipant);
router.get("/roomName/:roomName", meetingController.getMeetingIdByRoomName);

module.exports = router;
