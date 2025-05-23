const fs = require("fs");
const path = require("path");
const axios = require("axios");

// [POST] /audio/upload
exports.postUploadAudio = async (req, res) => {
  const file = req.file;
  const savePath = path.join(__dirname, "..", "uploads", file.originalname);
  fs.renameSync(file.path, savePath);

  // AI 서버 호출
  const aiRes = await axios.post("http://127.0.0.1:5000/process-file", {
    filePath: savePath,
    headers: { "Content-Type": "application/json" },
  });

  res.json({ message: "파일 업로드 완료", aiResult: aiRes.data });
};
