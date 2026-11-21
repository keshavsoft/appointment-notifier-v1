import { unregisterClient } from "../../lines.js";
import { notifyLinePresence } from "../../broadcast.js";

export function onClose(ws) {
  const lineId = ws.lineId;
  unregisterClient(ws);
  if (lineId) {
    notifyLinePresence(lineId);
  }
}
