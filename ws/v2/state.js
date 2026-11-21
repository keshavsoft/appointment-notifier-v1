const callsByKey = new Map();

export function getCurrentCallForKey(key = "1") {
  return callsByKey.get(key) || null;
}

export function setCurrentCallForKey(key = "1", number) {
  const call = {
    number,
    key,
    sentAt: Date.now()
  };
  callsByKey.set(key, call);
  return call;
}
