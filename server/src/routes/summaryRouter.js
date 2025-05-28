const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../models/db_users");
const upload = multer({ dest: "uploads/" });
const { v4: uuidv4 } = require("uuid");

const fs = require("fs");
const path = require("path");
const axios = require("axios");

router.post('/upload/audio', upload.single("audio"), async (req, res) => {
  console.log("summary DB 저장중");
  const file = req.file;
  console.log("file;; ", file.originalname);
  const savePath = path.join(__dirname, "..", "uploads", file.originalname);
  fs.renameSync(file.path, savePath);

  console.log("파일 :: ", savePath);
  // AI 서버 호출
  const aiRes = await axios.post("http://127.0.0.1:4000/process-file", {
    filePath: savePath,
    headers: { "Content-Type": "application/json" }
  });

  
  const { transcript, summary, tasks } = aiRes.data;
  
  const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  const generateUUID = () => {
    return uuidv4();
  };
  
  const data = [
    { summary_id: generateUUID(), status: 'fulltext', content: transcript, created_at: currentTimestamp},
    { summary_id: generateUUID(), status: 'keypoint', content: summary, created_at: currentTimestamp},
    { summary_id: generateUUID(), status: 'action', content: tasks, created_at: currentTimestamp}
  ];
  
  try {
    const query = `
    INSERT INTO summarys (summary_id, status, content, created_at, meeting_id)
    VALUES (?, ?, ?, ?, 1)
    `;
    
    for (let item of data) {
      const values = [item.summary_id, item.status, item.content, item.created_at];
      await db.execute(query, values);
    }
    
    // res.status(200).send('데이터 저장 완료');
    res.json({ message: "파일 업로드 완료", saveSummary: aiRes.data });
  } catch (error) {
    console.error('DB 저장 오류:', error);
    res.status(500).send('서버 오류');
  }
});


module.exports = router;