import { WebSocketServer } from "ws";
import { handleConnection } from "./handleConnection.js";
import { startHeartbeat } from "./heartbeat.js";

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, "http://localhost");

    if (url.pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws, req) => {
    handleConnection(ws, req, wss);
  });

  startHeartbeat(wss);

  return wss;
}
