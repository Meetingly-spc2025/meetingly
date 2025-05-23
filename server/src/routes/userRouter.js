const express = require("express");
// Node.js 에서 Express 라이브러리를 가져온다

const router = express.Router();

// express 안에 .Router() 라는 라우팅 전용 객체 (함수)가 들어있음.

// 로그인 로직 import
const { loginUser } = require("../controllers/userController");

// 실제 라우터 등록 - 로그인
router.post("/login", loginUser);

// // 실제 라우터 등록 - 회원가입 예정
// router.post("/register", );

// 12번이 실행되자마자 POST / login 이라는 라우트 정보가 내부적으로 저장됨
// router = {
//   stack: [
//     { path: '/login', method: 'POST', handler: loginUser }
//   ]
// }

module.exports = router;