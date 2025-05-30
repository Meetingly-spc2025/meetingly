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

    const { transcript, summary, tasks, discussion } = aiRes.data;
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const generateUUID = () => uuidv4();

    // ✅ tasks가 "없음"으로 간주되는 경우 처리
    const noTaskValues = ["/", "false", "", null, undefined];
    let taskArray = [];

    if (!noTaskValues.includes(tasks)) {
      if (typeof tasks === "string") {
        try {
          taskArray = JSON.parse(tasks);
        } catch (err) {
          console.error("tasks를 JSON으로 파싱 실패:", err);
          taskArray = [];
        }
      } else if (Array.isArray(tasks)) {
        taskArray = tasks;
      } else {
        console.warn("tasks 형식이 배열/문자열이 아님 (tasks 무시됨):", tasks);
      }
    } else {
      console.log("[⚠️] tasks가 없음으로 간주되는 값 (tasks 저장 스킵):", tasks);
    }

    // ✅ summaries 테이블 저장 (action은 content=null 처리)
    const summaries = [
      { summary_id: generateUUID(), status: 'fulltext', content: transcript, created_at: currentTimestamp },
      { summary_id: generateUUID(), status: 'keypoint', content: summary, created_at: currentTimestamp },
      {
        summary_id: generateUUID(),
        status: 'action',
        content: noTaskValues.includes(tasks) ? null : JSON.stringify(tasks),
        created_at: currentTimestamp
      },
      { summary_id: generateUUID(), status: 'discussion', content: discussion, created_at: currentTimestamp }
    ];

    const summaryQuery = `
      INSERT INTO summaries (summary_id, status, content, created_at, room_fullname)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (let item of summaries) {
      const values = [item.summary_id, item.status, item.content, item.created_at, roomId];
      await db.execute(summaryQuery, values);
    }
    console.log("[✅] summaries 테이블 저장 완료");

    // ✅ tasks 테이블 저장
    if (taskArray.length > 0) {
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
    } else {
      console.log("[⚠️] taskArray가 비어있음 (tasks 저장 스킵)");
    }

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
