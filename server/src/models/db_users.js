require("dotenv").config({ path: "../../.env" });

// require('dotenv')

// {
//   config: [Function: config],
//   parse: [Function: parse]
// }

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
});

// console.log("연결된 풀 객체 상태입니다",pool)

module.exports = pool;
// DB
