// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
import WebSocket from "ws";
import { Request, Response } from "express";
import { Server } from "http";
import { log, logError } from "./helpers";
import { timestamp } from "@raz1el/util";
import * as bf from "./buffer-helpers";

const BROADCASTERS_LIMIT = process.env.BROADCASTERS_LIMIT ? Number.parseInt(process.env.BROADCASTERS_LIMIT) : 10;
const ALLOW_MULTISTREAM = process.env.ALLOW_MULTISTREAM ? Number.parseInt(process.env.ALLOW_MULTISTREAM) : 0;

export class JsMpegSocket extends WebSocket.Server {
    connectionCount: number;
    clientAddress: Set<string>;

    constructor(server: Server) {
        super({ server });
        this.clientAddress = new Set<string>();
        this.connectionCount = 0;

        this.on("connection", (socket, req) => {
            this.connectionCount++;
            log(`WebSocket client connected: ${req.socket.remoteAddress}${req.socket.remotePort} [${this.connectionCount} total]`);

            socket.on("close", () => {
                this.connectionCount--;
                log(`WebSocket client disconnected: ${req.socket.remoteAddress}${req.socket.remotePort} [${this.connectionCount} total]`);
            });
        });

        this.on("close", () => {
            log("WebSocket closed");
        });

        this.on("error", (error) => {
            logError(error.message);
        });
    }
    broadcast(data: Buffer | string) {
        for (const client of this.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        }
    }
    // HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
    processMpegTs(req: Request, res: Response) {
        let ip = req.get("x-forwarded-for");
        ip = ip ? ip : req.ip;
        const address = ALLOW_MULTISTREAM ? (ip + ":" + timestamp()) : ip;

        if (process.env.STREAM_KEY && req.headers.authorization != process.env.STREAM_KEY) {
            log(`Broadcaster connection failed! address=${address} [wrong secret "${req.headers.authorization}"]`);
            res.end();
            return;
        }
        if (!ALLOW_MULTISTREAM && this.clientAddress.has(address)) {
            log(`Broadcaster multiple streams not allowed! address=${address}`);
            res.end();
            return;
        }
        if (BROADCASTERS_LIMIT && this.clientAddress.size >= BROADCASTERS_LIMIT) {
            log(`Broadcasters limit exceeded! address=${address} [${this.clientAddress.size}/${BROADCASTERS_LIMIT}]`);
            res.end();
            return;
        }

        const xTeam = req.get("x-team");
        const team = xTeam ? Number.parseInt(xTeam) : 0;

        this.clientAddress.add(address);
        const index = [...this.clientAddress].indexOf(address);
        const packBf = bf.packBuffer({ packType: bf.PackType.Mpegts, data: index, team, nickname: req.get("x-nickname") });

        log(`Broadcaster connected: id=${index}, address=${address} [${this.clientAddress.size}/${BROADCASTERS_LIMIT}]`);

        req.on("data", (data) => {
            this.broadcast(bf.packConcat(packBf, data));
        });

        req.on("close", () => {
            this.broadcast(bf.packBuffer({
                packType: bf.PackType.Event,
                data: index,
                type: bf.EventType.Close
            }));

            this.clientAddress.delete(address);
            log(`Broadcaster disconnected: id=${index}, address=${address} [${this.clientAddress.size}/${BROADCASTERS_LIMIT}]`);
        });
    }
}