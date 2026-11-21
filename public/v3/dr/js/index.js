import { getSavedKey, saveKey } from "./storage.js";
import { createCallMessage, createSetKeyMessage } from "./messages.js";
import {
  updateNumberDisplay,
  updateSendButtonState,
  updateKeyBadge,
  updateConnectionStatus,
  updatePresenceStatus,
  updateFeedbackMessage
} from "./dom.js";
import { createWebSocket, closeWebSocket } from "./websocket.js";

const dialedNumber = document.getElementById("dialedNumber");
const btnSend = document.getElementById("btnSend");
const btnClear = document.getElementById("btnClear");
const btnBack = document.getElementById("btnBack");
const btnQuickNext = document.getElementById("btnQuickNext");
const serverStatus = document.getElementById("serverStatus");
const pairedStatus = document.getElementById("pairedStatus");
const badgeKeyText = document.getElementById("badgeKeyText");
const btnChangeKey = document.getElementById("btnChangeKey");
const keyModal = document.getElementById("keyModal");
const keyInput = document.getElementById("keyInput");
const btnSaveKey = document.getElementById("btnSaveKey");
const feedback = document.getElementById("feedback");

let currentDigits = "";
let currentStationKey = getSavedKey();
let activeSocket = null;
let lastSentNumber = 0;

function promptKey() {
  keyInput.value = currentStationKey || "101";
  keyModal.classList.add("active");
  keyInput.focus();
}

function handleKeySaved() {
  const entered = keyInput.value.trim() || "1";
  currentStationKey = entered;
  saveKey(currentStationKey);
  keyModal.classList.remove("active");
  updateKeyBadge(badgeKeyText, currentStationKey);

  currentDigits = "";
  updateNumberDisplay(dialedNumber, currentDigits);
  updateSendButtonState(btnSend, false, activeSocket && activeSocket.readyState === 1);

  if (activeSocket && activeSocket.readyState === 1) {
    activeSocket.send(createSetKeyMessage(currentStationKey));
  } else {
    connect();
  }
}

function connect() {
  if (!currentStationKey) {
    promptKey();
    return;
  }
  updateKeyBadge(badgeKeyText, currentStationKey);

  closeWebSocket(activeSocket);

  const socket = createWebSocket(currentStationKey, {
    onOpen: () => {
      if (activeSocket !== socket) return;
      updateConnectionStatus(serverStatus, "సర్వర్ కనెక్ట్ అయింది", true);
      updateSendButtonState(btnSend, currentDigits.length > 0, true);
    },
    onClose: () => {
      if (activeSocket !== socket) return;
      updateConnectionStatus(serverStatus, "డిస్‌కనెక్ట్ అయింది", false);
      updateSendButtonState(btnSend, false, false);
      setTimeout(() => {
        if (activeSocket === socket) connect();
      }, 2000);
    },
    onMessage: (event) => {
      if (activeSocket !== socket) return;
      const data = JSON.parse(event.data);
      if (data.type === "presence") {
        updatePresenceStatus(pairedStatus, data.onlineCount);
      }
    }
  });

  activeSocket = socket;
}

btnChangeKey.addEventListener("click", promptKey);
btnSaveKey.addEventListener("click", handleKeySaved);

document.querySelectorAll("[data-digit]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (currentDigits.length < 3) {
      currentDigits += btn.getAttribute("data-digit");
      updateNumberDisplay(dialedNumber, currentDigits);
      updateSendButtonState(btnSend, true, activeSocket && activeSocket.readyState === 1);
    }
  });
});

btnClear.addEventListener("click", () => {
  currentDigits = "";
  updateNumberDisplay(dialedNumber, currentDigits);
  updateSendButtonState(btnSend, false, activeSocket && activeSocket.readyState === 1);
});

btnBack.addEventListener("click", () => {
  currentDigits = currentDigits.slice(0, -1);
  updateNumberDisplay(dialedNumber, currentDigits);
  updateSendButtonState(btnSend, currentDigits.length > 0, activeSocket && activeSocket.readyState === 1);
});

btnQuickNext.addEventListener("click", () => {
  const next = lastSentNumber + 1;
  currentDigits = String(next);
  updateNumberDisplay(dialedNumber, currentDigits);
  updateSendButtonState(btnSend, true, activeSocket && activeSocket.readyState === 1);
});

btnSend.addEventListener("click", () => {
  if (!currentDigits || !activeSocket || activeSocket.readyState !== 1) return;
  const num = currentDigits;
  lastSentNumber = Number(num) || lastSentNumber;

  activeSocket.send(createCallMessage(num, currentStationKey));
  updateFeedbackMessage(feedback, `టోకెన్ ${num} డిస్‌ప్లేకి పంపబడింది (కీ: ${currentStationKey})`);
  currentDigits = "";
  updateNumberDisplay(dialedNumber, currentDigits);
  updateSendButtonState(btnSend, false, true);
});

if (!currentStationKey) {
  promptKey();
} else {
  updateKeyBadge(badgeKeyText, currentStationKey);
  connect();
}
