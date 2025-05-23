const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");

// const apiRouter = require("./routes/apiRouter");
const initSocket = require("./socket/socketServer");

dotenv.config();

const app = express();
app.use(cors());
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }));
app.use(express.json());

// 라우터
// app.use("/api", apiRouter);

// 배포 모드
if (process.env.NODE_ENV === "production") {
  const rootPath = path.resolve(__dirname, "../../client");
  app.use(express.static(rootPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootPath, "index.html"));
  });
}

// httpServer 생성 + socket 서버 초기화
const httpServer = http.createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
