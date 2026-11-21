import { registerClientKey } from "../../keys.js";
import { getCurrentCallForKey } from "../../state.js";
import { notifyKeyPresence } from "../../broadcast.js";

export function handleSetKey(message, ws) {
  const key = message.key || "1";
  const role = message.role || ws.role || "client";

  registerClientKey(ws, key, role);

  ws.send(JSON.stringify({
    type: "state",
    cause: "sync",
    key: ws.key,
    announcement: getCurrentCallForKey(ws.key)
  }));

  notifyKeyPresence(ws.key);
}
