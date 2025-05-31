const express = require("express");
const router = express.Router();
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

// 특정 summary에 연결된 tasks 조회
router.get("/summary/:summary_id", async (req, res) => {
  const { summary_id } = req.params;
  try {
    // summary_id로 연결된 모든 task를 created_at 기준으로 오름차순 조회
    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE summary_id = ? ORDER BY created_at ASC",
      [summary_id]
    );
    res.json(tasks);
  } catch (err) {
    console.error("GET /summary/:summary_id 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

// 특정 meeting의 action summary_id만 연결된 tasks 조회
router.get("/meeting/:meeting_id", async (req, res) => {
  const { meeting_id } = req.params;
  try {
    // 1. meeting_id로부터 room_fullname 조회
    const [roomResult] = await db.query(
      "SELECT room_fullname FROM meetings WHERE meeting_id = ?",
      [meeting_id]
    );
    const room_fullname = roomResult[0]?.room_fullname;
    if (!room_fullname) {
      return res.status(404).json({ error: "meeting_id의 room_fullname이 없습니다." });
    }

    // 2. 해당 room_fullname과 status=action인 summary_id 찾기
    const [summaryResult] = await db.query(
      "SELECT summary_id FROM summaries WHERE room_fullname = ? AND status = 'action'",
      [room_fullname]
    );
    const summary_id = summaryResult[0]?.summary_id;
    if (!summary_id) {
      return res.status(404).json({ error: "action 상태 summary가 없습니다." });
    }

    // 3. 찾은 summary_id에 연결된 tasks 조회
    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE summary_id = ? ORDER BY created_at ASC",
      [summary_id]
    );

    res.json(tasks);
  } catch (err) {
    console.error("GET /meeting/:meeting_id 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

// 새로운 task 추가 (assignee_id는 선택)
router.post("/", async (req, res) => {
  const { content, assignee_id, status, summary_id } = req.body;
  const task_id = uuidv4();

  try {
    // 새로운 task 데이터를 INSERT (assignee_id가 없으면 null로 처리)
    await db.query(
      "INSERT INTO tasks (task_id, content, assignee_id, status, summary_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [task_id, content, assignee_id || null, status, summary_id]
    );
    res.status(201).json({ task_id }); // 생성된 task_id 반환
  } catch (err) {
    console.error("POST / 에러:", err);
    res.status(500).json({ error: "추가 실패" });
  }
});

// 특정 task 수정
router.put("/:task_id", async (req, res) => {
  const { task_id } = req.params;
  const { content, assignee_id, status } = req.body;

  // assignee_id가 빈 문자열이면 null로 처리
  const finalAssigneeId = assignee_id === "" ? null : assignee_id;

  try {
    // task_id 기준으로 내용, 담당자, 상태를 수정
    await db.query(
      "UPDATE tasks SET content = ?, assignee_id = ?, status = ? WHERE task_id = ?",
      [content, finalAssigneeId, status, task_id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("PUT /:task_id 에러:", err);
    res.status(500).json({ error: "수정 실패" });
  }
});

// 특정 task 삭제
router.delete("/:task_id", async (req, res) => {
  const { task_id } = req.params;
  try {
    await db.query("DELETE FROM tasks WHERE task_id = ?", [task_id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("DELETE /:task_id 에러:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
});

// 특정 팀의 멤버 목록 조회
router.get("/team/:team_id/members", async (req, res) => {
  const { team_id } = req.params;
  try {
    // team_id로 연결된 팀 멤버 목록 조회
    const [members] = await db.query(
      `SELECT u.user_id, u.name, u.nickname
       FROM team_members tm
       JOIN users u ON tm.user_id = u.user_id
       WHERE tm.team_id = ?`,
      [team_id]
    );
    res.json(members);
  } catch (err) {
    console.error("GET /team/:team_id/members 에러:", err);
    res.status(500).json({ error: "팀 멤버 조회 실패" });
  }
});

module.exports = router;
