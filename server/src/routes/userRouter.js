const express = require("express");
const router = express.Router();

// 로그인 로직 import
const { loginUser } = require("../controllers/userController");

// jwt 토큰 검증 미들웨어 로직 import. 아래가 next()
const { authenticate } = require("../middlewares/authJwtMiddleware");
// jwt 토큰 정상 시 유저 정보 주는 로직
const { getUserInfo } = require("../controllers/userController");

// 실제 라우터 등록 - 로그인
router.post("/login", loginUser);
router.get("/jwtauth", authenticate, getUserInfo);

module.exports = router;