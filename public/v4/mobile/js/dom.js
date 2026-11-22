import { numberToTeluguWords } from "./teluguWords.js";

export function setPill(pill, text, isOk) {
  if (!pill) return;
  pill.classList.remove("connected", "offline");
  pill.classList.add(isOk ? "connected" : "offline");
  var textNode = pill.lastChild;
  if (textNode) textNode.textContent = text;
}

export function updateKeyBadge(badgeElement, key) {
  if (badgeElement) {
    badgeElement.textContent = key;
  }
}

export function formatElapsed(sentAt) {
  if (!sentAt) return "వేచి ఉంది…";
  var sec = Math.max(0, Math.floor((Date.now() - sentAt) / 1000));
  if (sec < 60) return sec + "సె క్రితం";
  var mins = Math.floor(sec / 60);
  var rem = sec % 60;
  return mins + "ని " + (rem > 0 ? rem + "సె " : "") + "క్రితం";
}

export function renderActive(elements, activeCall, isConnected) {
  const { activeNum, activeWords, activeElapsed, btnRecall } = elements;
  if (!activeCall || !activeCall.number) {
    activeNum.textContent = "--";
    activeWords.textContent = "కాల్ కోసం వేచి ఉంది";
    activeElapsed.textContent = "వేచి ఉంది…";
    btnRecall.disabled = true;
    return;
  }
  activeNum.textContent = activeCall.number;
  var n = Number(activeCall.number);
  activeWords.textContent = (isFinite(n) && n >= 0) ? numberToTeluguWords(n) : "";
  activeElapsed.textContent = formatElapsed(activeCall.sentAt);
  btnRecall.disabled = !isConnected;
}

export function updateView(selectedNumber, sendButton, currentDigits, isConnected) {
  selectedNumber.textContent = currentDigits || "—";
  sendButton.disabled = (!currentDigits || !isConnected);
}
