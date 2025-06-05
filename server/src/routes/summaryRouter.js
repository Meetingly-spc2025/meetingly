const express = require("express");
const router = express.Router();
const multer = require("multer");
const { handleUploadRecord } = require("../controllers/summaryController");

const upload = multer({ dest: "uploads/" });

router.post('/upload/record', upload.single("audio"), handleUploadRecord);

module.exports = router;
