export function createCallMessage(number, key) {
  return JSON.stringify({
    type: "call",
    number,
    key,
    from: "dr"
  });
}

export function createSetKeyMessage(key) {
  return JSON.stringify({
    type: "setKey",
    key,
    role: "dr"
  });
}
