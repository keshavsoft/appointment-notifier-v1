import { registerClientKey } from "../../keys.js";
import { getCurrentCallForKey } from "../../state.js";
import { notifyKeyPresence } from "../../broadcast.js";

export function onConnect(ws, req) {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  const url = new URL(req.url, "http://localhost");
  const key = url.searchParams.get("key") || "1";
  const role = url.searchParams.get("role") || "client";

  registerClientKey(ws, key, role);

  ws.send(JSON.stringify({
    type: "state",
    cause: "sync",
    key: ws.key,
    announcement: getCurrentCallForKey(ws.key)
  }));

  notifyKeyPresence(ws.key);
}
