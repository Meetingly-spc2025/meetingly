const express = require("express");
const router = express.Router();
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

// [GET] /api/meetinglists/task/:teamId
// 특정 팀의 전체 회의 목록을 페이지네이션으로 조회
router.get("/task/:teamId", async (req, res) => {
  const { teamId } = req.params; 
  const page = parseInt(req.query.page) || 1; 
  const pageSize = 6;
  const offset = (page - 1) * pageSize; 

  console.log("팀 ID:", teamId);

  try {
    // 1. 팀별 전체 회의 목록 조회
    const [meetings] = await db.query(`
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
      WHERE m.team_id = ?
      GROUP BY m.meeting_id
      ORDER BY m.start_time DESC
      LIMIT ? OFFSET ?
    `, [teamId, pageSize, offset]);

    // 2. 전체 개수 조회 (페이지네이션을 위해)
    const [totalCountResult] = await db.query(`
      SELECT COUNT(*) AS totalCount
      FROM meetings m
      JOIN participants p ON m.meeting_id = p.meeting_id
      WHERE m.team_id = ?
    `, [teamId]);

    // 3. 응답
    res.json({
      meetings,
      totalDataCount: totalCountResult[0].totalCount
    });
  } catch (error) {
    console.error("GET /api/meetinglists/task/:teamId 에러:", error);
    res.status(500).json({ error: "조회 실패" });
  }
});


// [GET] /api/meetinglists/task/:teamId/by-date
// 특정 팀의 '특정 날짜' 회의 목록만 조회하는 라우터
router.get("/task/:teamId/by-date", async (req, res) => {
  const { teamId } = req.params;         // URL 파라미터 (팀 ID)
  const { date } = req.query;            // 쿼리 파라미터 (조회할 날짜: YYYY-MM-DD)
  const page = parseInt(req.query.page) || 1;
  const pageSize = 6;
  const offset = (page - 1) * pageSize;

  if (!date) {
    return res.status(400).json({ error: "날짜가 필요합니다." });
  }

  console.log("팀 ID:", teamId, "선택한 날짜:", date);

  try {
    // 1. 팀 ID + 날짜로 회의 목록 조회
    const [meetings] = await db.query(`
      SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date,
        u.name AS host,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.team_id = ? AND DATE(m.start_time) = ?
      GROUP BY m.meeting_id
      ORDER BY m.start_time DESC
      LIMIT ? OFFSET ?
    `, [teamId, date, pageSize, offset]);

    // 2. 전체 개수 조회 (날짜 기준)
    const [totalCountResult] = await db.query(`
      SELECT COUNT(*) AS totalCount
      FROM meetings
      WHERE team_id = ? AND DATE(start_time) = ?
    `, [teamId, date]);

    // 3. 응답
    res.json({
      meetings,
      totalDataCount: totalCountResult[0].totalCount
    });
  } catch (error) {
    console.error("GET /api/meetinglists/task/:teamId/by-date 에러:", error);
    res.status(500).json({ error: "조회 실패" });
  }
});

// /api/meetinglists/task/:teamId/by-month
router.get("/task/:teamId/by-month", async (req, res) => {
  const { teamId } = req.params;
  const { year, month } = req.query; // year=2025, month=05

  try {
    const [meetings] = await db.query(
      `
      SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y-%m-%d') AS date,
        DATE_FORMAT(m.start_time, '%H:%i') AS startTime,
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members
      FROM meetings m
      JOIN participants p ON m.meeting_id = p.meeting_id
      JOIN users u2 ON p.user_id = u2.user_id
      WHERE m.team_id = ? AND YEAR(m.start_time) = ? AND MONTH(m.start_time) = ?
      GROUP BY m.meeting_id
      ORDER BY m.start_time ASC
      `,
      [teamId, year, month]
    );

    res.json({ meetings });
  } catch (error) {
    console.error("GET /by-month 에러:", error);
    res.status(500).json({ error: "조회 실패" });
  }
});

module.exports = router;
