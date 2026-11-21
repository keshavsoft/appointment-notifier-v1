export function updateNumberDisplay(element, digits) {
  element.textContent = digits || "—";
}

export function updateSendButtonState(button, hasDigits, isSocketOpen) {
  button.disabled = (!hasDigits || !isSocketOpen);
}

export function updateKeyBadge(badgeElement, key) {
  badgeElement.textContent = key;
}

export function updateConnectionStatus(pillElement, text, isConnected) {
  pillElement.classList.toggle("connected", isConnected);
  pillElement.lastChild.textContent = text;
}

export function updatePresenceStatus(pillElement, count) {
  pillElement.lastChild.textContent = "ఆన్‌లైన్: " + count;
}

export function updateFeedbackMessage(element, message) {
  element.textContent = message;
}
