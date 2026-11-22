export function createCallMessage(number, key) {
  return JSON.stringify({
    type: "call",
    number,
    key,
    from: "mobile"
  });
}

export function createSetKeyMessage(key) {
  return JSON.stringify({
    type: "setKey",
    key,
    role: "mobile"
  });
}
