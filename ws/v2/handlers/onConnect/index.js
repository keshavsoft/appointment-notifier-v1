import { registerClient } from "../../lines.js";
import { getCurrentCall } from "../../state.js";
import { notifyLinePresence } from "../../broadcast.js";

export function onConnect(ws, req, wss) {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  const url = new URL(req.url, "http://localhost");
  const lineId = url.searchParams.get("line") || url.searchParams.get("room") || "1";
  const role = url.searchParams.get("role") || "client";

  registerClient(ws, lineId, role);

  ws.send(JSON.stringify({
    type: "state",
    cause: "sync",
    line: ws.lineId,
    announcement: getCurrentCall(ws.lineId),
    onlineCount: wss.clients.size
  }));

  notifyLinePresence(ws.lineId);
}
