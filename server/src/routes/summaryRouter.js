const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../models/db_users");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const upload = multer({ dest: "uploads/" });

router.post('/upload/record', upload.single("audio"), async (req, res) => {
  const { roomId } = req.body;
  const file = req.file;

  console.log("audioController 에서 받은 roomID:", roomId);

  if (!roomId || !file) {
    return res.status(400).json({ error: "roomId와 오디오 파일은 필수입니다." });
  }

  // 📂 파일 저장
  const roomDir = path.join(__dirname, "..", "uploads", roomId);
  if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true });

  const savePath = path.join(roomDir, file.originalname);
  fs.renameSync(file.path, savePath);
  console.log("저장된 파일 경로:", savePath);

  try {
    // 🚀 AI 서버에 파일 경로 포함하여 요청
    const aiRes = await axios.post(
      "http://127.0.0.1:4000/process-room",
      { roomId, audioPath: savePath },
      { headers: { "Content-Type": "application/json" } }
    );

    const { transcript, summary, tasks } = aiRes.data;
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const generateUUID = () => uuidv4();

    // 📌 summarys 테이블 저장
    const summaries = [
      { summary_id: generateUUID(), status: 'fulltext', content: transcript, created_at: currentTimestamp },
      { summary_id: generateUUID(), status: 'keypoint', content: summary, created_at: currentTimestamp },
      { summary_id: generateUUID(), status: 'action', content: tasks, created_at: currentTimestamp }
    ];

    const summaryQuery = `
      INSERT INTO summaries (summary_id, status, content, created_at, room_fullname)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (let item of summaries) {
      const values = [item.summary_id, item.status, item.content, item.created_at, roomId];
      await db.execute(summaryQuery, values);
    }

    console.log("[✅] summarys 테이블 저장 완료");

    // 📌 tasks 테이블 저장 (tasks는 JSON 배열로 가정)
    const taskArray = JSON.parse(tasks); // AI가 JSON 배열 반환한다고 가정
    const actionSummaryId = summaries.find(s => s.status === 'action').summary_id;

    const taskQuery = `
      INSERT INTO tasks (task_id, content, assignee_id, status, created_at, summary_id)
      VALUES (?, ?, NULL, 'todo', ?, ?)
    `;

    for (let taskContent of taskArray) {
      const taskId = generateUUID();
      const values = [taskId, taskContent, currentTimestamp, actionSummaryId];
      await db.execute(taskQuery, values);
    }

    console.log("[✅] tasks 테이블 저장 완료");

    res.json({ message: "녹음 업로드 및 DB 저장 완료", aiResult: aiRes.data });
  } catch (error) {
    console.error('[❌] AI 서버 or DB 저장 오류:', error.response ? error.response.data : error.message);
    res.status(500).json({
      error: "서버 오류",
      details: error.response ? error.response.data : error.message
    });
  }
});

module.exports = router;
