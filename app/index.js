const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../pages/index.html"))
})

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/", req.path))
})

app.listen(80, () => {
    console.log("Listening on http://localhost:80")
})