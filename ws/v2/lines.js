const lines = new Map();

export function registerClient(ws, lineId = "1", role = "client") {
  unregisterClient(ws);

  ws.lineId = lineId;
  ws.role = role;

  if (!lines.has(lineId)) {
    lines.set(lineId, new Set());
  }
  lines.get(lineId).add(ws);
  return lineId;
}

export function unregisterClient(ws) {
  if (ws.lineId && lines.has(ws.lineId)) {
    const set = lines.get(ws.lineId);
    set.delete(ws);
    if (set.size === 0) {
      lines.delete(ws.lineId);
    }
  }
}

export function getClientsForLine(lineId) {
  return lines.get(lineId) || new Set();
}

export function getLineCount(lineId) {
  return getClientsForLine(lineId).size;
}
