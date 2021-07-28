import express from "express";
import session from "express-session";
//import parser from "body-parser";
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
const PASSWORD = process.env.WEBSITE_PASSWORD ? process.env.WEBSITE_PASSWORD : "admin";

// Incoming ts-stream from client app
app.post("/", (req, res) => {
    socket.processMpegTs(req, res);
});

// css, js etc file access
app.use("/public", express.static(path.join(PATH + "/public")));

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Login page
app.get("/", (req, res) => {
    res.sendFile(path.join(PATH + "/login.html"));
});

// Home page
app.get("/home", (req, res) => {
    // @ts-ignore
    if (req.session.loggedin)
        res.sendFile(path.join(PATH + "/index.html"));
    else {
        res.send("Please login to view this page!");
        res.end();
    }
});

// REST API
app.post("/auth", (req, res) => {
    if (req.body && req.body.password == PASSWORD) {
        // @ts-ignore
        req.session.loggedin = true;
        res.redirect("/home");
    }
    else
        res.send("Incorrect Password!");
    res.end();
});

http.listen(PORT, () => {
    log(`Local web server URL: http://localhost:${PORT}`);
});