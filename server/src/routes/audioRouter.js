const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const controller = require("../controllers/audioController");


// 1. 일반 업로드 처리 (roomId 없음)
router.post("/upload/file", upload.single("audio"), controller.postUploadAudio);

// 2. 실시간 녹음 업로드 처리 (roomId 필요)
router.post("/upload/record", upload.single("audio"), controller.postUploadRecord);

module.exports = router;
