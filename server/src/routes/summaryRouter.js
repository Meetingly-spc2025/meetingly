const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  handleUploadRecord,
  handleUploadAudio,
} = require("../controllers/summaryController");
const upload = multer({ dest: "uploads/" });

router.post("/upload/record", upload.single("audio"), handleUploadRecord);
router.post("/upload/file", upload.single("audio"), handleUploadAudio);

module.exports = router;
