const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const db = require("../models/meetingly_db");
const { getIO } = require("../socket/ioInstance");

const handleUploadRecord = async (req, res) => {
  const { roomId, isCreator } = req.body;
  const file = req.file;

  console.log("summaryController 에서 받은 roomID:", roomId);

  if (!roomId || !file) {
    return res.status(400).json({ error: "roomId와 오디오 파일은 필수입니다." });
  }

  const roomDir = path.join(__dirname, "..", "uploads", roomId);
  if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true });

  const savePath = path.join(roomDir, file.originalname);
  fs.renameSync(file.path, savePath);
  console.log("저장된 파일 경로:", savePath);

  if (isCreator !== "true") {
    return res.status(204).end();
  }

  try {
    const aiRes = await axios.post(
      "http://127.0.0.1:4000/process-room",
      { roomId, audioPath: savePath },
      { headers: { "Content-Type": "application/json" } },
    );

    // 주요 키워드 keywords로 추가 !!
    const { transcript, summary, tasks, discussion, keywords } = aiRes.data;
    console.log("주요 단어:: ", keywords);
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const generateUUID = () => uuidv4();

    const summaries = [
      {
        summary_id: generateUUID(),
        status: "fulltext",
        content: transcript,
        created_at: currentTimestamp,
      },
      {
        summary_id: generateUUID(),
        status: "keypoint",
        content: summary,
        created_at: currentTimestamp,
      },
      {
        summary_id: generateUUID(),
        status: "action",
        content: tasks,
        created_at: currentTimestamp,
      },
      {
        summary_id: generateUUID(),
        status: "discussion",
        content: discussion,
        created_at: currentTimestamp,
      },
      {
        summary_id: generateUUID(),
        status: "keywords",
        content: keywords,
        created_at: currentTimestamp,
      },
    ];

    const summaryQuery = `
      INSERT INTO summaries (summary_id, status, content, created_at, room_fullname)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (let item of summaries) {
      await db.execute(summaryQuery, [
        item.summary_id,
        item.status,
        item.content,
        item.created_at,
        roomId,
      ]);
    }
    console.log("summaries 테이블 저장 완료");

    let taskArray = [];

    if (typeof tasks === "string") {
      const cleaned = tasks.replace(/```json|```/g, "").trim();
      if (cleaned.toLowerCase() !== "false") {
        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) taskArray = parsed;
        } catch (err) {
          console.warn("tasks 파싱 실패:", err.message);
        }
      }
    } else if (Array.isArray(tasks)) {
      taskArray = tasks;
    }

    if (taskArray.length > 0) {
      const actionSummaryId = summaries.find((s) => s.status === "action").summary_id;
      const taskQuery = `
        INSERT INTO tasks (task_id, content, assignee_id, status, created_at, finished_at, summary_id)
        VALUES (?, ?, NULL, 'todo', ?, ?, ?)
      `;
      for (let taskContent of taskArray) {
        const taskId = generateUUID();
        await db.execute(taskQuery, [
          taskId,
          taskContent,
          currentTimestamp,
          currentTimestamp,
          actionSummaryId,
        ]);
      }
      console.log("tasks 테이블 저장 완료");
    }

    res.json({ message: "녹음 업로드 및 DB 저장 완료", aiResult: aiRes.data });

    await deleteRoomUploadFolder(roomId);
    const io = getIO();
    io.to(roomId).emit("summary_done", {
      roomId,
      message: "AI 회의록 요약이 완료되었습니다.",
    });
  } catch (error) {
    console.error(
      "AI 서버 or DB 저장 오류:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).json({
      error: "서버 오류",
      details: error.response ? error.response.data : error.message,
    });
    await deleteRoomUploadFolder(roomId);
  }
};

// 파일 업로드 요약
const handleUploadAudio = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "파일이 없습니다." });

  const savePath = path.join(__dirname, "..", "uploads", file.originalname);

  // 임시 파일을 지정 위치로 이동
  fs.renameSync(file.path, savePath);
  console.log("파일!! :: ", savePath);

  try {
    // AI 서버에 파일 경로 전달
    const aiRes = await axios.post(
      "http://127.0.0.1:4000/process-file",
      {
        filePath: savePath,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    console.log("ai:: ", aiRes.data);

    res.json({ message: "파일 업로드 완료", result: aiRes.data });
    await fs.promises.rm(savePath);
  } catch (error) {
    console.error("오류 발생:", error);

    // 실패해도 파일 삭제
    try {
      if (fs.existsSync(savePath)) {
        await fs.promises.rm(savePath);
        console.log("에러 후 파일 삭제됨");
      }
    } catch (unlinkErr) {
      console.error("파일 삭제 실패:", unlinkErr);
    }

    res.status(500).json({ message: "파일 처리 실패", error: error.message });
    await deleteRoomUploadFolder(roomId);
  }
};

// uploads/{roomId} 삭제 함수
const deleteRoomUploadFolder = async (roomId) => {
  const roomDir = path.join(__dirname, "..", "uploads", roomId);
  if (fs.existsSync(roomDir)) {
    try {
      await fs.promises.rm(roomDir, { recursive: true, force: true });
      console.log(`uploads/${roomId} 폴더 삭제 완료`);
    } catch (err) {
      console.error(`uploads/${roomId} 삭제 실패:`, err.message);
    }
  }
};

module.exports = { handleUploadRecord, handleUploadAudio };
