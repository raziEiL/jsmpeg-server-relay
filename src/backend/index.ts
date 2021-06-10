import express from "express";
import fs from "fs";
import path from "path";
import { createServer } from "http";

process.on("uncaughtException", (err) => {
    fs.writeFileSync("crash.log", err.message);
});

import { log } from "./src/helpers";
import * as ws from "./src/websocket";

/*
|==========================================================================
| HTTP SERVER
|==========================================================================
*/
const app = express();
const http = createServer(app);
const socket = new ws.JsMpegSocket(http);
const PATH = path.join(__dirname, "..", "frontend");
const PORT = process.env.PORT ? process.env.PORT : 80;

app.use(express.static(PATH));

app.all("/", (req, res) => {
    /* res.setHeader("Access-Control-Allow-Origin", "*"); */
    socket.processMpegTs(req, res);
});

http.listen(PORT, () => {
    log(`Local web server URL: http://localhost:${PORT}`);
});