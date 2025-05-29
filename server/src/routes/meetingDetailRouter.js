const express = require("express");
const router = express.Router();
const db = require("../models/db_users");

router.get("/:meetingId", async (req, res) => {
  const { meetingId } = req.params;
  const { teamId } = req.query;

  try {
    const [meetingResult] = await db.query(`
      SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date,
        TIME_FORMAT(TIMEDIFF(m.end_time, m.start_time), '%H:%i:%s') AS totalDuration,
        u.name AS host,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.meeting_id = ?
      GROUP BY m.meeting_id
    `, [meetingId]);

    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "회의를 찾을 수 없습니다." });
    }

    const [summaries] = await db.query(`
      SELECT summary_id, status, content, created_at, room_fullname
      FROM summaries
      WHERE room_fullname = (
        SELECT room_fullname FROM meetings WHERE meeting_id = ?
      )
    `, [meetingId]);

    res.json({
      meeting: meetingResult[0],
      summaries: summaries
    });
  } catch (err) {
    console.error("회의 상세 데이터 조회 오류:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

module.exports = router;
