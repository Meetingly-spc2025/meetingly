// // 에러 체크용 2
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("🔥 비동기 에러 발생:", reason);
// });

// // 에러 체크용
// process.on("uncaughtException", (err) => {
//   console.error("🔥 uncaughtException 발생:", err);
// });

const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const db = require("./src/models/db_users"); // 네가 만든 db pool 불러오기

// .env 적용된 상태에서 라우터 실행
const initSocket = require("./src/socket/socketServer");
const userRouter = require("./src/routes/userRouter");
const meetingRouter = require("./src/routes/meetingRouter");
const taskRoutes = require("./src/routes/tasksRouter");
const audioRouter = require("./src/routes/audioRouter");

dotenv.config({ path: "../.env" });
const app = express();
// const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

app.use("/tasks", taskRoutes);
app.use("/audio", audioRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/users", userRouter);

// try {
  // userRouter = require("./src/routes/userRouter");
  // console.log("userRouter 불러오기 성공");
  
  // }catch (err) {
    // console.error("userRouter 불러오기 실패:", err);
    // }
    
// 디버깅용 라우터
app.use((req, res, next) => {
  console.log("라우터 자체가 불리는지 테스트:", req.method, req.url);
  next();
});
    

// 배포 모드
if (process.env.NODE_ENV === "production") {
  const rootPath = path.resolve(__dirname, "../../client");
  app.use(express.static(rootPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootPath, "index.html"));
  });
}

// DB 에러 체크용
(async () => {
  try {
    const [rows] = await db.query("SELECT 1"); // 테스트 쿼리
    console.log("DB 연결 성공:", rows);
  } catch (err) {
    console.error("DB 연결 실패:", err);
  }
})();

// httpServer 생성 + socket 서버 초기화
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.SERVER_PORT;
console.log("process.env.SERVER_PORT:", process.env.SERVER_PORT);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
