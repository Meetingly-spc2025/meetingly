const fs = require("fs");
const path = require("path");
const axios = require("axios");

// [POST] /audio/upload
exports.postUploadAudio = async (req, res) => {
  try {
    const { roomId } = req.body;
    const file = req.file;

    if (!roomId || !file) {
      return res.status(400).json({ error: "roomId 또는 파일이 없습니다." });
    }

    // 방 ID별 디렉토리 생성
    const roomDir = path.join(__dirname, "..", "uploads", roomId);
    if (!fs.existsSync(roomDir)) fs.mkdirSync(roomDir, { recursive: true });

    // 파일 이동
    const targetPath = path.join(roomDir, file.originalname);
    fs.renameSync(file.path, targetPath);

    console.log(`[📥] 파일 저장 완료: ${targetPath}`);

    // AI 서버에 전달
    const aiRes = await axios.post("http://localhost:5000/process-audio", {
      roomId,
    });

    return res.json({
      message: "파일 업로드 및 처리 완료",
      aiResult: aiRes.data,
    });
  } catch (err) {
    console.error("[✘] 업로드 처리 실패:", err);
    return res.status(500).json({ error: "서버 내부 오류" });
  }
};
