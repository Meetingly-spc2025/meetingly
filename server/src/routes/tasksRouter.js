const express = require("express");
const router = express.Router();
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");

// summary_id에 따른 전체 task 목록 조회
router.get("/:summary_id", async (req, res) => {
  const { summary_id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE summary_id = ? ORDER BY created_at ASC",
      [summary_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /tasks/:summary_id 에러:", err);
    res.status(500).json({ error: "조회 실패" });
  }
});

// 새로운 task 추가
router.post("/", async (req, res) => {
  const { content, assignee_id, status, summary_id } = req.body;
  const task_id = uuidv4();
  try {
    await db.query(
      "INSERT INTO tasks (task_id, content, assignee_id, status, summary_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [task_id, content, assignee_id, status, summary_id]
    );
    res.status(201).json({ task_id });
  } catch (err) {
    console.error("POST /tasks 에러:", err);
    res.status(500).json({ error: "추가 실패" });
  }
});

// task 수정
router.put("/:task_id", async (req, res) => {
  const { task_id } = req.params;
  const { content, assignee_id, status } = req.body;
  try {
    await db.query(
      "UPDATE tasks SET content = ?, assignee_id = ?, status = ? WHERE task_id = ?",
      [content, assignee_id, status, task_id]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error("PUT /tasks/:task_id 에러:", err);
    res.status(500).json({ error: "수정 실패" });
  }
});

// task 삭제
router.delete("/:task_id", async (req, res) => {
  const { task_id } = req.params;
  try {
    await db.query("DELETE FROM tasks WHERE task_id = ?", [task_id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("DELETE /tasks/:task_id 에러:", err);
    res.status(500).json({ error: "삭제 실패" });
  }
});

module.exports = router;
