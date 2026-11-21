import { setCurrentCallForKey } from "../../state.js";
import { broadcastToKey } from "../../broadcast.js";

export function handleCall(message, ws) {
  const key = message.key || ws.key || "1";
  const announcement = setCurrentCallForKey(key, message.number);

  broadcastToKey(key, {
    type: "state",
    cause: "call",
    key,
    announcement,
    from: message.from || ws.role || "dr"
  }, ws);
}
