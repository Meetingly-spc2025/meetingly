const express = require("express");
const router = express.Router();
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 6;
  const offset = (page - 1) * pageSize;

  try {
    const [meetings] = await db.query(`
      SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date,
        u.name AS host,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN teamMembers tm_host ON m.teamMember_id = tm_host.teamMember_id
      JOIN users u ON tm_host.user_id = u.user_id
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN teamMembers tm_participant ON p.teamMember_id = tm_participant.teamMember_id
      JOIN users u2 ON tm_participant.user_id = u2.user_id
      GROUP BY m.meeting_id
      ORDER BY m.start_time DESC
      LIMIT ? OFFSET ?
    `, [pageSize, offset]);

    const [totalCountResult] = await db.query(`
      SELECT COUNT(*) AS totalCount
      FROM meetings m
      JOIN participants p ON m.meeting_id = p.meeting_id
    `);

    res.json({
      meetings: meetings,
      totalDataCount: totalCountResult[0].totalCount,  // 전체 회의 수
    });
  } catch (error) {
    console.error("GET /api/meetinglists 에러:", error);
    res.status(500).json({ error: "조회 실패" });
  }
});


module.exports = router;
