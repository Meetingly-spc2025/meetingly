const express = require("express");
const router = express.Router();
const db = require("../models/db_users");

// [GET] /api/meetingDetail/${meetingId}?teamId=${teamId}
// 특정 회의의 상세 정보를 가져오는 라우트
router.get("/:meetingId", async (req, res) => {
  const { meetingId } = req.params;       // URL 파라미터로 전달되는 meetingId
  const { teamId } = req.query;           // 쿼리 파라미터로 전달되는 teamId

  try {
    // 1. 회의 기본 정보 + 참석자 목록 조회
    //   - 회의 제목, 날짜, 총 소요 시간
    //   - 호스트 이름
    //   - 참석자 목록 (쉼표로 구분된 문자열)
    const [meetingResult] = await db.query(`
      SELECT
        m.meeting_id,
        m.title,
        m.creator_id,
        DATE_FORMAT(m.start_time, '%Y. %m. %d') AS date, -- 날짜 형식 포맷
        TIME_FORMAT(TIMEDIFF(m.end_time, m.start_time), '%H:%i:%s') AS totalDuration, -- 소요 시간 계산
        u.name AS host, -- 호스트 이름
        GROUP_CONCAT(DISTINCT u2.name ORDER BY u2.name SEPARATOR ', ') AS members -- 참석자 목록을 쉼표로 묶어서 반환
      FROM meetings m
      JOIN users u ON m.creator_id = u.user_id -- 회의 생성자(호스트)
      JOIN participants p ON m.meeting_id = p.meeting_id -- 참가자 관계
      JOIN users u2 ON p.user_id = u2.user_id -- 참가자 이름
      WHERE m.meeting_id = ?
      GROUP BY m.meeting_id
    `, [meetingId]);

    // 조회 결과가 없으면 404 반환
    if (meetingResult.length === 0) {
      return res.status(404).json({ error: "회의를 찾을 수 없습니다." });
    }
    // 2. 회의에 연결된 summaries 정보 조회 (ex. 논의사항, 요약, fulltext 등)
    //   - room_fullname으로 연결
    const [summaries] = await db.query(`
      SELECT summary_id, status, content, created_at, room_fullname
      FROM summaries
      WHERE room_fullname = (
        SELECT room_fullname FROM meetings WHERE meeting_id = ?
      )
    `, [meetingId]);
    // 최종 JSON으로 회의 정보 + summaries 반환
    res.json({
      meeting: meetingResult[0],
      summaries: summaries
    });
  } catch (err) {
    // 에러 처리
    console.error("회의 상세 데이터 조회 오류:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

// [DELETE] /api/meetingDetail/meeting/:meetingId
router.delete("/meeting/:meetingId", async (req, res) => {
  const { meetingId } = req.params;
  try {
    const [[roomRow] = []] = await db.query(
      "SELECT room_fullname FROM meetings WHERE meeting_id = ?",
      [meetingId]
    );
    if (!roomRow || !roomRow.room_fullname) {
      return res.status(404).json({ error: "회의를 찾을 수 없습니다." });
    }
    const roomFullname = roomRow.room_fullname;
    const [summaryRows] = await db.query(
      "SELECT summary_id FROM summaries WHERE room_fullname = ?",
      [roomFullname]
    );
    const summaryIds = summaryRows.map((row) => row.summary_id);
    if (summaryIds.length > 0) {
      await db.query(
        `DELETE FROM tasks WHERE summary_id IN (${summaryIds.map(() => '?').join(',')})`,
        summaryIds
      );
    }
    await db.query("DELETE FROM summaries WHERE room_fullname = ?", [roomFullname]);
    await db.query("DELETE FROM participants WHERE meeting_id = ?", [meetingId]);
    await db.query("DELETE FROM meetings WHERE meeting_id = ?", [meetingId]);
    res.sendStatus(200);
  } catch (err) {
    console.error("회의 삭제 오류:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
});



// [PATCH] /api/meetingDetail/meeting/:meetingId
router.patch("/meeting/:meetingId", async (req, res) => {
  const { meetingId } = req.params;
  const { meetingName } = req.body;
  if (!meetingName) {
    return res.status(400).json({ error: "meetingName이 필요합니다." });
  }
  try {
    const [result] = await db.query(
      "UPDATE meetings SET title = ? WHERE meeting_id = ?",
      [meetingName, meetingId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "해당 회의를 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "회의 제목이 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error("회의 제목 수정 오류:", err);
    res.status(500).json({ error: "수정 실패" });
  }
});

// [PUT] /api/meetingDetail/summary/:summaryId
router.put("/summary/:summaryId", async (req, res) => {
  const { summaryId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "content는 필수입니다." });
  }
  try {
    const [result] = await db.query(
      "UPDATE summaries SET content = ? WHERE summary_id = ?",
      [content, summaryId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "해당 요약이 존재하지 않습니다." });
    }
    res.status(200).json({ message: "요약이 성공적으로 수정되었습니다." });
  } catch (err) {
    console.error("Summary 수정 오류:", err);
    res.status(500).json({ error: "수정 실패" });
  }
});



module.exports = router;
