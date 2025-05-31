const express = require("express");
const router = express.Router();
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

// GET /api/meetinglists/task/:teamId
// 특정 팀의 회의 목록을 페이지네이션으로 조회하는 라우터
router.get("/task/:teamId", async (req, res) => {
  const { teamId } = req.params;                     // URL 파라미터로 전달되는 팀 ID
  const page = parseInt(req.query.page) || 1;        // 쿼리 파라미터 page (기본값 1)
  const pageSize = 6;                                 // 한 페이지에 보여줄 개수
  const offset = (page - 1) * pageSize;              // SQL OFFSET 계산

  console.log("팀 ID:", teamId);

  try {
    // 1. 팀별 회의 목록을 최신순으로 조회
    //   - 회의 제목, 날짜, 총 소요 시간
    //   - 호스트 이름
    //   - 참석자 이름을 쉼표로 묶어서 반환
    const [meetings] = await db.query(`
      SELECT
        m.meeting_id,
        m.title,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date, 
        TIME_FORMAT(TIMEDIFF(m.end_time, m.start_time), '%H:%i:%s') AS totalDuration, -- 총 회의시간
        u.name AS host, -- 호스트 이름
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members -- 참석자 목록
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id           -- 회의 생성자 (호스트)
      JOIN participants p ON m.meeting_id = p.meeting_id -- 참가자 관계
      JOIN users u2 ON p.user_id = u2.user_id            -- 참석자 이름
      WHERE m.team_id = ?
      GROUP BY m.meeting_id
      ORDER BY m.start_time DESC
      LIMIT ? OFFSET ?
    `, [teamId, pageSize, offset]);

    // 2. 전체 회의 개수를 계산 (페이지네이션 위해 필요)
    const [totalCountResult] = await db.query(`
      SELECT COUNT(*) AS totalCount
      FROM meetings m
      JOIN participants p ON m.meeting_id = p.meeting_id
      WHERE m.team_id = ?
    `, [teamId]);

    // 3. 최종 응답
    res.json({
      meetings: meetings,                           
      totalDataCount: totalCountResult[0].totalCount 
    });
  } catch (error) {
    // 에러 처리
    console.error("GET /api/meetinglists/:teamId 에러:", error);
    res.status(500).json({ error: "조회 실패" });
  }
});

module.exports = router;
