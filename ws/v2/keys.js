const connectedKeys = new Map();

export function registerClientKey(ws, key = "1", role = "client") {
  unregisterClientKey(ws);

  ws.key = key;
  ws.role = role;

  if (!connectedKeys.has(key)) {
    connectedKeys.set(key, new Set());
  }
  connectedKeys.get(key).add(ws);
  return key;
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
  return connectedKeys.get(key) || new Set();
}

export function getClientsCountForKey(key) {
  return getClientsForKey(key).size;
}
