const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const db = require("./src/models/meetingly_db"); // 네가 만든 db pool 불러오기
const session = require("express-session");
const cookieParse = require("cookie-parser");

// .env 적용된 상태에서 라우터 실행
const { initIO } = require("./src/socket/ioInstance");
const initSocket = require("./src/socket/socketServer");

// Route
const userRouter = require("./src/routes/userRouter");
const meetingRouter = require("./src/routes/meetingRouter");
const teamRouter = require("./src/routes/teamRouter");
const mypageRouter = require("./src/routes/mypageRouter");
const summaryRouter = require("./src/routes/summaryRouter");
const meetingDataRouter = require("./src/routes/meetingDataRouter");

dotenv.config({ path: "../.env" });
const app = express();
// const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// HTTP 와 HTTPS 모두 동작하게끔..
const isRealServer = process.env.NODE_ENV === "production";

// HTTPS 프록시 환경 대응
if (isRealServer) {
  app.set("trust proxy", 1);
}

app.use(cookieParse());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: isRealServer,
      maxAge: 10000 * 60 * 5, // 5분
    },
  }),
);

// 디버깅용 라우터
app.use((req, res, next) => {
  console.log("라우터 자체가 불리는지 테스트:", req.method, req.url);
  next();
});

app.use("/api/users", userRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/teams", teamRouter);
app.use("/api/mypage", mypageRouter);
app.use("/api/meetingData", meetingDataRouter);
app.use("/api/saveSummary", summaryRouter);

// 배포 모드
// if (process.env.NODE_ENV === "production") {
//   const rootPath = path.resolve(__dirname, "../../client");
//   app.use(express.static(rootPath));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(rootPath, "index.html"));
//   });
// }

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
const io = initIO(httpServer);
initSocket(io);

const PORT = process.env.SERVER_PORT;
console.log("process.env.SERVER_PORT:", process.env.SERVER_PORT);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
