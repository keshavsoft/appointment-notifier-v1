import { getSavedKey, saveKey } from "./storage.js";
import { createCallMessage, createSetKeyMessage } from "./messages.js";
import { setPill, formatElapsed, renderActive, updateView, updateKeyBadge } from "./dom.js";
import { createMobileWebSocket, closeMobileWebSocket } from "./websocket.js";

const selectedNumber = document.getElementById("selectedNumber");
const sendButton = document.getElementById("sendCall");
const feedback = document.getElementById("feedback");
const serverStatus = document.getElementById("serverStatus");
const screenStatus = document.getElementById("screenStatus");
const keyClear = document.getElementById("keyClear");
const keyBack = document.getElementById("keyBack");
const btnQuickNext = document.getElementById("btnQuickNext");
const btnRecall = document.getElementById("btnRecall");

const badgeKeyText = document.getElementById("badgeKeyText");
const btnChangeKey = document.getElementById("btnChangeKey");
const keyModal = document.getElementById("keyModal");
const keyInput = document.getElementById("keyInput");
const btnSaveKey = document.getElementById("btnSaveKey");

const activeNum = document.getElementById("activeNum");
const activeWords = document.getElementById("activeWords");
const activeElapsed = document.getElementById("activeElapsed");

const activeElements = { activeNum, activeWords, activeElapsed, btnRecall };

let currentDigits = "";
let currentStationKey = getSavedKey();
let socket = null;
let retryTimer = null;
let isConnected = false;
let activeCall = null;
let lastSentNumber = 0;

function promptKey() {
  keyInput.value = currentStationKey || "101";
  keyModal.classList.add("active");
  keyInput.focus();
}

function handleKeySaved() {
  const entered = keyInput.value.trim() || "101";
  currentStationKey = entered;
  saveKey(currentStationKey);
  keyModal.classList.remove("active");
  updateKeyBadge(badgeKeyText, currentStationKey);

  currentDigits = "";
  updateView(selectedNumber, sendButton, currentDigits, isConnected);

  if (socket && socket.readyState === 1) {
    socket.send(createSetKeyMessage(currentStationKey));
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

  if (socket) {
    closeMobileWebSocket(socket);
    socket = null;
  }

  setPill(serverStatus, "కనెక్ట్ అవుతోంది…", false);

  socket = createMobileWebSocket(currentStationKey, {
    onOpen: () => {
      isConnected = true;
      setPill(serverStatus, "సర్వర్ కనెక్ట్ అయింది", true);
      updateView(selectedNumber, sendButton, currentDigits, isConnected);
      renderActive(activeElements, activeCall, isConnected);
    },
    onClose: () => {
      isConnected = false;
      socket = null;
      setPill(serverStatus, "డిస్‌కనెక్ట్ అయింది", false);
      updateView(selectedNumber, sendButton, currentDigits, isConnected);
      renderActive(activeElements, activeCall, isConnected);
      scheduleRetry();
    },
    onError: () => {
      setPill(serverStatus, "కనెక్షన్ సమస్య", false);
    },
    onMessage: (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch (e) { return; }

      if (data.type === "presence" && data.onlineCount !== undefined) {
        setPill(screenStatus, "స్క్రీన్స్: " + data.onlineCount, data.onlineCount > 1);
      } else if (data.onlineCount !== undefined) {
        setPill(screenStatus, "స్క్రీన్స్: " + data.onlineCount, data.onlineCount > 1);
      }

      if (data.type === "state" && data.announcement && data.announcement.number) {
        activeCall = data.announcement;
        lastSentNumber = Number(activeCall.number) || lastSentNumber;
        renderActive(activeElements, activeCall, isConnected);
        if (data.cause === "call") {
          feedback.textContent = `టోకెన్ ${activeCall.number} డిస్‌ప్లేకి పంపబడింది (కీ: ${currentStationKey})`;
        }
      }
    }
  });
}

function scheduleRetry() {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    connect();
  }, 2000);
}

btnChangeKey.addEventListener("click", promptKey);
btnSaveKey.addEventListener("click", handleKeySaved);

// Keypad numeric button listeners
document.querySelectorAll("[data-digit]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (currentDigits.length < 3) {
      currentDigits += btn.getAttribute("data-digit");
      updateView(selectedNumber, sendButton, currentDigits, isConnected);
    }
  });
});

keyClear.addEventListener("click", () => {
  currentDigits = "";
  updateView(selectedNumber, sendButton, currentDigits, isConnected);
});

keyBack.addEventListener("click", () => {
  currentDigits = currentDigits.slice(0, -1);
  updateView(selectedNumber, sendButton, currentDigits, isConnected);
});

sendButton.addEventListener("click", () => {
  if (!currentDigits || !socket || socket.readyState !== 1) return;
  const num = currentDigits;
  lastSentNumber = Number(num) || lastSentNumber;
  socket.send(createCallMessage(num, currentStationKey));
  feedback.textContent = `టోకెన్ ${num} డిస్‌ప్లేకి పంపబడింది (కీ: ${currentStationKey})`;
  currentDigits = "";
  updateView(selectedNumber, sendButton, currentDigits, isConnected);
});

btnRecall.addEventListener("click", () => {
  if (!activeCall || !activeCall.number || !socket || socket.readyState !== 1) return;
  socket.send(createCallMessage(activeCall.number, currentStationKey));
  feedback.textContent = `టోకెన్ ${activeCall.number} మళ్లీ పిలవబడింది (కీ: ${currentStationKey})`;
});

btnQuickNext.addEventListener("click", () => {
  let next = 1;
  if (activeCall && !isNaN(Number(activeCall.number))) {
    next = Number(activeCall.number) + 1;
  } else if (lastSentNumber > 0) {
    next = lastSentNumber + 1;
  }
  currentDigits = String(next);
  updateView(selectedNumber, sendButton, currentDigits, isConnected);
});

setInterval(() => {
  if (activeCall && activeCall.sentAt) {
    activeElapsed.textContent = formatElapsed(activeCall.sentAt);
  }
}, 1000);

if (!currentStationKey) {
  promptKey();
} else {
  updateKeyBadge(badgeKeyText, currentStationKey);
  connect();
}
