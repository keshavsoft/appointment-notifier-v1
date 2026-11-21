import { getClientsForKey, getClientsCountForKey } from "./keys.js";

export function broadcastToKey(key, data, sender = null) {
  const payload = JSON.stringify(data);
  const clients = getClientsForKey(key);
  for (const client of clients) {
    if (client.readyState === 1 && client !== sender) {
      client.send(payload);
    }
  }
}

export function notifyKeyPresence(key) {
  broadcastToKey(key, {
    type: "presence",
    key,
    onlineCount: getClientsCountForKey(key)
  });
}
