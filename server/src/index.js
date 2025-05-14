const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

app.listen(PORT, () => {
    console.log("server is open!");
    console.log("http://localhost:" + PORT);
})