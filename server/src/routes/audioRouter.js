const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const controller = require("../controllers/Caudio");

// 1. 일반 업로드 처리 (roomId 없음)
router.post("/upload/file", upload.single("audio"), controller.postUploadAudio);

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
