const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt")
const controllers = require("../controllers/userController")
const { authenticate } = require("../middlewares/authJwtMiddleware");

// 실제 라우터 등록 - 로그인
router.post("/login", controllers.loginUser);
// 실제 라우터 등록 - jwwt 토큰 검증 및 유저 정보
router.get("/jwtauth", authenticate, controllers.getUserInfo);
// 실제 라우터 등록 - 이메일 중복 확인
router.post("/check-email", controllers.checkEmailDuplicate);
// 실제 라우터 등록 - 이메일 인증
router.post("/verify-email", controllers.sendVerificationCode)
// 실제 라우터 등록 - 닉네임 중복 체크
router.post("/check-nickname", controllers.checkNicknameDuplicate)
// 실제 라우터 등록 - 회원가입
router.post("/register",controllers.registerUser)

module.exports = router;
