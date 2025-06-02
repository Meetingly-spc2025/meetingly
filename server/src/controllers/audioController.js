const fs = require("fs");
const path = require("path");
const axios = require("axios");

// [POST] /audio/upload
exports.postUploadAudio = async (req, res) => {
  const file = req.file;
  const savePath = path.join(__dirname, "..", "uploads", file.originalname);

  // 임시 파일을 지정 위치로 이동
  fs.renameSync(file.path, savePath);
  console.log("파일!! :: ", savePath);

  try {
    // AI 서버에 파일 경로 전달
    const aiRes = await axios.post(
      "http://localhost:4000/process-file",
      {
        filePath: savePath,
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("ai:: ", aiRes.data);

    // 파일 삭제
    await fs.promises.unlink(savePath);
    console.log("업로드된 파일 삭제 완료");

    // 응답 반환
    res.json({ message: "파일 업로드 완료", aiResult: aiRes.data });
  } catch (error) {
    console.error("오류 발생:", error);

    // 실패해도 파일 삭제
    try {
      if (fs.existsSync(savePath)) {
        await fs.promises.unlink(savePath);
        console.log("에러 후 파일 삭제됨");
      }
    } catch (unlinkErr) {
      console.error("파일 삭제 실패:", unlinkErr);
    }

    res.status(500).json({ message: "파일 처리 실패", error: error.message });
  }
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

  let aiRes;
  try {
    aiRes = await axios.post("http://localhost:4000/process-room", {
      roomId,
    });

    console.log("AI 응답:", aiRes.data);
  } catch (err) {
    console.error("AI 서버 호출 실패:", err.message);
    return res.status(500).json({ error: "AI 서버 호출 실패" });
  }

  // 삭제
  try {
    if (fs.existsSync(roomDir)) {
      fs.rmSync(roomDir, { recursive: true, force: true });
      console.log(`uploads/${roomId} 폴더 삭제 완료`);
    }
  } catch (err) {
    console.warn(`uploads/${roomId} 폴더 삭제 중 오류:`, err.message);
  }

  res.json({ message: "녹음 업로드 완료", aiResult: aiRes.data });
};
