import { numberToTeluguWords } from "./teluguWords.js";

export function updateDisplayView(tokenElement, spellingElement, elapsedElement, activeCall) {
  if (!activeCall || !activeCall.number) {
    tokenElement.textContent = "--";
    spellingElement.textContent = "కాల్ కోసం వేచి ఉంది…";
    elapsedElement.textContent = "తదుపరి కాల్ కోసం వేచి ఉంది";
    return;
  }
  tokenElement.textContent = String(activeCall.number);
  spellingElement.textContent = numberToTeluguWords(activeCall.number);
  const sec = Math.max(0, Math.floor((Date.now() - (activeCall.sentAt || Date.now())) / 1000));
  elapsedElement.textContent = sec + "సె క్రితం పిలవబడింది";
}

export function updateKeyBadge(badgeElement, metaRoomElement, key) {
  badgeElement.textContent = key;
  metaRoomElement.textContent = "కీ: " + key;
}

export function updateConnectionStatus(element, text) {
  element.textContent = text;
}

export function updateVoiceButton(button, isEnabled) {
  button.textContent = isEnabled ? "🔊 వాయిస్ ఆన్" : "🔇 వాయిస్ ఆఫ్";
}
