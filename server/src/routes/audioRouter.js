const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 1. 일반 업로드 처리 (roomId 없음)
router.post("/upload/file", upload.single("audio"), async (req, res) => {
  const file = req.file;
  console.log("받았음 :: ", file);

  const savePath = path.join(__dirname, "..", "uploads", file.originalname);
  fs.renameSync(file.path, savePath);

  console.log("저장된 경로 :: ", savePath);

  // AI 서버 호출
  const aiRes = await axios.post("http://127.0.0.1:5000/process-file", {
    filePath: savePath,
    headers: { "Content-Type": "application/json" },
  });

  res.json({ message: "파일 업로드 완료", aiResult: aiRes.data });
});

// 2. 실시간 녹음 업로드 처리 (roomId 필요)
// router.post("/upload/record", upload.single("audio"), async (req, res) => {
//   const { roomId } = req.body;
//   const file = req.file;

//   if (!roomId) return res.status(400).json({ error: "roomId는 필수입니다." });

//   const roomDir = path.join(__dirname, "..", "uploads", roomId);
//   if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true });

//   const savePath = path.join(roomDir, file.originalname);
//   fs.renameSync(file.path, savePath);

//   const aiRes = await axios.post("http://localhost:5000/process-room", {
//     roomId,
//   });

//   res.json({ message: "녹음 업로드 완료", aiResult: aiRes.data });
// });

module.exports = router;
