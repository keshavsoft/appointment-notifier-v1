import { getSavedKey, saveKey } from "./storage.js";
import { createSetKeyMessage } from "./messages.js";
import {
  updateDisplayView,
  updateKeyBadge,
  updateConnectionStatus,
  updateVoiceButton
} from "./dom.js";
import {
  createAudioContext,
  resumeAudioContext,
  playAnnouncementAudio
} from "./audio.js";
import { createWebSocket, closeWebSocket } from "./websocket.js";

const tokenNum = document.getElementById("tokenNum");
const tokenSpell = document.getElementById("tokenSpell");
const elapsedTime = document.getElementById("elapsedTime");
const connStatusText = document.getElementById("connStatusText");
const voiceToggle = document.getElementById("voiceToggle");
const badgeKeyText = document.getElementById("badgeKeyText");
const metaRoomVal = document.getElementById("metaRoomVal");
const btnChangeKey = document.getElementById("btnChangeKey");
const keyModal = document.getElementById("keyModal");
const keyInput = document.getElementById("keyInput");
const btnSaveKey = document.getElementById("btnSaveKey");

let currentStationKey = getSavedKey();
let activeCall = null;
let voiceEnabled = true;
let activeSocket = null;
let audioCtx = null;
const audioCache = {};

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
  updateKeyBadge(badgeKeyText, metaRoomVal, currentStationKey);

  activeCall = null;
  updateDisplayView(tokenNum, tokenSpell, elapsedTime, activeCall);

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
  updateKeyBadge(badgeKeyText, metaRoomVal, currentStationKey);

  closeWebSocket(activeSocket);

  const socket = createWebSocket(currentStationKey, {
    onOpen: () => {
      if (activeSocket !== socket) return;
      updateConnectionStatus(connStatusText, "డిస్‌ప్లే కనెక్ట్ అయింది");
    },
    onClose: () => {
      if (activeSocket !== socket) return;
      updateConnectionStatus(connStatusText, "డిస్‌కనెక్ట్ అయింది");
      setTimeout(() => {
        if (activeSocket === socket) connect();
      }, 2000);
    },
    onMessage: (event) => {
      if (activeSocket !== socket) return;
      const data = JSON.parse(event.data);
      if (data.type === "state") {
        activeCall = data.announcement;
        updateDisplayView(tokenNum, tokenSpell, elapsedTime, activeCall);
        if (data.cause === "call" && activeCall && activeCall.number && voiceEnabled) {
          playAnnouncementAudio(audioCtx, audioCache, activeCall.number);
        }
      }
    }
  });

  activeSocket = socket;
}

btnChangeKey.addEventListener("click", promptKey);
btnSaveKey.addEventListener("click", handleKeySaved);

voiceToggle.addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  updateVoiceButton(voiceToggle, voiceEnabled);
  if (!audioCtx) audioCtx = createAudioContext();
  resumeAudioContext(audioCtx);
});

window.addEventListener("click", () => {
  if (!audioCtx) audioCtx = createAudioContext();
  resumeAudioContext(audioCtx);
}, { passive: true });

setInterval(() => {
  updateDisplayView(tokenNum, tokenSpell, elapsedTime, activeCall);
}, 1000);

if (!currentStationKey) {
  promptKey();
} else {
  updateKeyBadge(badgeKeyText, metaRoomVal, currentStationKey);
  connect();
}
