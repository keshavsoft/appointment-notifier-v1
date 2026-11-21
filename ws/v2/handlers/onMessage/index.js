import { handleCall } from "./handleCall.js";

export function onMessage(raw, ws, wss) {
  const message = JSON.parse(raw.toString());

  if (message.type === "call") {
    handleCall(message, ws, wss);
  }
}
