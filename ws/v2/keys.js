const connectedKeys = new Map();

export function registerClientKey(ws, key = "1", role = "client") {
  unregisterClientKey(ws);

  const cleanKey = String(key || "1").trim();
  ws.key = cleanKey;
  ws.role = String(role || "client").trim();

  if (!connectedKeys.has(cleanKey)) {
    connectedKeys.set(cleanKey, new Set());
  }
  connectedKeys.get(cleanKey).add(ws);
  return cleanKey;
}

export function unregisterClientKey(ws) {
  if (ws.key && connectedKeys.has(ws.key)) {
    const set = connectedKeys.get(ws.key);
    set.delete(ws);
    if (set.size === 0) {
      connectedKeys.delete(ws.key);
    }
  }
}

export function getClientsForKey(key) {
  const cleanKey = String(key || "1").trim();
  return connectedKeys.get(cleanKey) || new Set();
}

export function getClientsCountForKey(key) {
  return getClientsForKey(key).size;
}
