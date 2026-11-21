import { handleCall } from "./handleCall.js";
import { handleSetKey } from "./handleSetKey.js";

export function onMessage(raw, ws, wss) {
  const message = JSON.parse(raw.toString());

  if (message.type === "call") {
    handleCall(message, ws, wss);
  }

  if (message.type === "setKey") {
    handleSetKey(message, ws);
  }
}
