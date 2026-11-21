const callsByLine = new Map();

export function getCurrentCall(lineId = "1") {
  return callsByLine.get(lineId) || null;
}

export function setCurrentCall(number, lineId = "1") {
  const call = {
    number,
    line: lineId,
    sentAt: Date.now()
  };
  callsByLine.set(lineId, call);
  return call;
}
