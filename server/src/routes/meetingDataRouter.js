const express = require("express");
const router = express.Router();
const controller = require("../controllers/meetingDataController");
const { authenticate } = require("../middlewares/authJwtMiddleware");

// 회의 상세
router.get("/meetingDetail/:meetingId", controller.getMeetingDetail);
router.delete("/meetingDetail/meeting/:meetingId", controller.deleteMeeting);
router.patch("/meetingDetail/meeting/:meetingId", controller.updateMeetingTitle);
router.put("/meetingDetail/summary/:summaryId", controller.updateSummaryContent);

// 회의 목록
router.get("/meetinglists/:teamId", controller.getMeetingList);

// 할 일 관련
router.get("/tasks/summary/:summary_id", controller.getTasksBySummary);
router.get("/tasks/meeting/:meeting_id", controller.getTasksByMeeting);
router.post("/tasks", controller.createTask);
router.put("/tasks/:task_id", controller.updateTask);
router.delete("/tasks/:task_id", controller.deleteTask);

// 팀 멤버 조회
router.get("/tasks/team/:team_id/members", controller.getTeamMembers);

// 회의 목록
router.get("/meetinglists/task/:teamId", authenticate, controller.getMeetingsByTeam);
router.get("/meetinglists/task/:teamId/by-date", controller.getMeetingsByDate);
router.get("/meetinglists/task/:teamId/by-month", controller.getMeetingsByMonth);

module.exports = router;
