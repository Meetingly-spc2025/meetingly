// // 에러 체크용 2
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("🔥 비동기 에러 발생:", reason);
// });

// // 에러 체크용
// process.on("uncaughtException", (err) => {
//   console.error("🔥 uncaughtException 발생:", err);
// });

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");

// .env 적용된 상태에서 라우터 실행
const userRouter = require("./src/routes/userRouter");


const app = express();
// const PORT = process.env.PORT || 5000;

app.use(cors());
// 미들웨어
app.use(express.json());

// 디버깅용 라우터
app.use((req, res, next) => {
  console.log("라우터 자체가 불리는지 테스트:", req.method, req.url);
  next();
});

// // 로그인 라우터
app.use("/api/users", userRouter);

  // try {
  // userRouter = require("./src/routes/userRouter");
  // console.log("userRouter 불러오기 성공");
  
  // }catch (err) {
  // console.error("userRouter 불러오기 실패:", err);
  // }


const audioRouter = require("./src/routes/audioRouter");
app.use("/audio", audioRouter);

// 배포 모드
if (process.env.NODE_ENV === "production") {
  const rootPath = path.resolve(__dirname, "../../client");
  app.use(express.static(rootPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootPath, "index.html"));
  });
}

const db = require("./src/models/db_users"); // 네가 만든 db pool 불러오기

// DB 에러 체크용
(async () => {
  try {
    const [rows] = await db.query("SELECT 1"); // 테스트 쿼리
    console.log("DB 연결 성공:", rows);
  } catch (err) {
    console.error("DB 연결 실패:", err);
  }
})();

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
