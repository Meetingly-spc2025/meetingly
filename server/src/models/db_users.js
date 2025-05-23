require('dotenv').config({path: "../.env"}); // 이런거.. 

// require('dotenv')

    // { 
    //   config: [Function: config],
    //   parse: [Function: parse]
    // }

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true
});

module.exports = pool;
// DB 