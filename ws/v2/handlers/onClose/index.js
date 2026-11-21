import { unregisterClientKey } from "../../keys.js";
import { notifyKeyPresence } from "../../broadcast.js";

export function onClose(ws) {
  const key = ws.key;
  unregisterClientKey(ws);
  if (key) {
    notifyKeyPresence(key);
  }
}
