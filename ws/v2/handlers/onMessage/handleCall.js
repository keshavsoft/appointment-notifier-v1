import { setCurrentCall } from "../../state.js";
import { broadcastToLine } from "../../broadcast.js";
import { getLineCount } from "../../lines.js";

export function handleCall(message, ws) {
  const targetLine = message.line || ws.lineId || "1";
  const announcement = setCurrentCall(message.number, targetLine);

  broadcastToLine(targetLine, {
    type: "state",
    cause: "call",
    line: targetLine,
    announcement,
    onlineCount: getLineCount(targetLine)
  });
}
