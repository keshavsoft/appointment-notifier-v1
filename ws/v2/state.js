const callsByKey = new Map();

export function getCurrentCallForKey(key = "1") {
  const cleanKey = String(key || "1").trim();
  return callsByKey.get(cleanKey) || null;
}

export function setCurrentCallForKey(key = "1", number) {
  const cleanKey = String(key || "1").trim();
  const call = {
    number: String(number).trim(),
    key: cleanKey,
    sentAt: Date.now()
  };
  callsByKey.set(cleanKey, call);
  return call;
}
