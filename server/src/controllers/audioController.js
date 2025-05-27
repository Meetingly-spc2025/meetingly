const fs = require("fs");
const path = require("path");
const axios = require("axios");

// [POST] /audio/upload
exports.postUploadAudio = async (req, res) => {
  const file = req.file;
  const savePath = path.join(__dirname, "..", "uploads", file.originalname);
  fs.renameSync(file.path, savePath);

  console.log("파일 :: ", savePath);
  // AI 서버 호출
  const aiRes = await axios.post("http://127.0.0.1:4000/process-file", {
    filePath: savePath,
    headers: { "Content-Type": "application/json" }
  });

  res.json({ message: "파일 업로드 완료", aiResult: aiRes.data });
};

exports.postUploadRecord = async (req, res) => {
  const { roomId } = req.body;
  const file = req.file;

  console.log("audioController 에서 받은 roomID: ", roomId);

  if (!roomId) return res.status(400).json({ error: "roomId는 필수입니다." });

  const roomDir = path.join(__dirname, "..", "uploads", roomId);
  if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true });

  const savePath = path.join(roomDir, file.originalname);
  fs.renameSync(file.path, savePath);

  const aiRes = await axios.post("http://127.0.0.1:4000/process-room", {
    roomId,
  });

  res.json({ message: "녹음 업로드 완료", aiResult: aiRes.data });
};
