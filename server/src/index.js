const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const apiRouter = require("./routes/apiRouter");

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

// 라우터
app.use("/api", apiRouter);

// 배포 모드
if (process.env.NODE_ENV === "production") {
  const rootPath = path.resolve(__dirname, "../../client");
  app.use(express.static(rootPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(rootPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
