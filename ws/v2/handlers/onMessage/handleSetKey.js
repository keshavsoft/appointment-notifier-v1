import { registerClientKey } from "../../keys.js";
import { getCurrentCallForKey } from "../../state.js";
import { notifyKeyPresence } from "../../broadcast.js";

export function handleSetKey(message, ws) {
  const oldKey = ws.key;
  const newKey = String(message.key || "1").trim();
  const role = message.role || ws.role || "client";

  registerClientKey(ws, newKey, role);

  ws.send(JSON.stringify({
    type: "state",
    cause: "sync",
    key: ws.key,
    announcement: getCurrentCallForKey(ws.key)
  }));

  if (oldKey && oldKey !== newKey) {
    notifyKeyPresence(oldKey);
  }
  notifyKeyPresence(newKey);
}
