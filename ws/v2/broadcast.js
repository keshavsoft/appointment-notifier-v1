import { getClientsForLine, getLineCount } from "./lines.js";

export function broadcastToLine(lineId, data, sender = null) {
  const payload = JSON.stringify(data);
  const clients = getClientsForLine(lineId);
  for (const client of clients) {
    if (client.readyState === 1 && client !== sender) {
      client.send(payload);
    }
  }
}

export function notifyLinePresence(lineId) {
  broadcastToLine(lineId, {
    type: "presence",
    line: lineId,
    onlineCount: getLineCount(lineId)
  });
}
