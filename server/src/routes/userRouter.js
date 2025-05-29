const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt")

// 로그인 로직 import
const { loginUser } = require("../controllers/userController");
// jwt 토큰 검증 미들웨어 로직 import. 아래가 next()
const { authenticate } = require("../middlewares/authJwtMiddleware");
// jwt 토큰 정상 시 유저 정보 주는 로직
const { getUserInfo } = require("../controllers/userController");
// 이메일 중복 확인 로직
const { checkEmailDuplicate } = require("../controllers/userController")
// 이메일 인증
const { sendVerificationCode } = require("../controllers/userController")
// 닉네임 중복 체크
const { checkNicknameDuplicate } = require("../controllers/userController")
// 회원가입
const { registerUser } = require("../controllers/userController")

// 실제 라우터 등록 - 로그인
router.post("/login", loginUser);
// 실제 라우터 등록 - jwwt 토큰 검증 및 유저 정보
router.get("/jwtauth", authenticate, getUserInfo);
// 실제 라우터 등록 - 이메일 중복 확인
router.post("/check-email", checkEmailDuplicate);
// 실제 라우터 등록 - 이메일 인증
router.post("/verify-email", sendVerificationCode)
// 실제 라우터 등록 - 닉네임 중복 체크
router.post("/check-nickname", checkNicknameDuplicate)
// 실제 라우터 등록 - 회원가입
router.post("/register",registerUser)

// 마이페이지 정보 수정

module.exports = router;
