# 🏛️ CareCall Architecture Deep Dive

This document details the architectural decisions, design patterns, and engineering principles behind CareCall.

---

## 1. The Invariant `/ws` Contract Strategy

### The Problem
In distributed or hardware-heavy web apps (such as wall-mounted smart TVs in hospital waiting rooms and doctor phone bookmarks), hardcoding versioned endpoints (like `/ws/v1` and `/ws/v2`) creates **high operational friction**:
- Changing an endpoint requires walking into waiting rooms with remote controls to update TV browser bookmarks.
- Doctors lose connectivity if they load an old bookmark.

### The Solution: Pluggable Driver Pattern
CareCall keeps the external protocol contract immutable:
```text
All clients connect exclusively to: ws://<host>:<port>/ws
```

Inside [`app.js`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/app.js), the server switches the internal WebSocket execution engine behind this invariant endpoint:

```javascript
import { attachWebSocketServer as attachV1 } from "./ws/v1/attachWebSocketServer.js";
import { attachWebSocketServer as attachV2 } from "./ws/v2/attachWebSocketServer.js";

const attachWebSocketServer = attachV2; // Change to attachV1 for instant rollback
```

---

## 2. Station Key Pairing Engine (V2 Backend)

The V2 backend ([`ws/v2/`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/ws/v2/)) replaces the single-broadcast megaphone with a **targeted Station Key registry**:

### File Structure
- **[`keys.js`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/ws/v2/keys.js)**: Maintains an in-memory `Map<string, Set<WebSocket>>` tracking connected sockets partitioned by Station Key.
- **[`state.js`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/ws/v2/state.js)**: Partitions active token announcements per key (`callsByKey = new Map()`).
- **[`broadcast.js`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/ws/v2/broadcast.js)**: Iterates only over the sockets registered to a given key, with mandatory sender exclusion:
  ```javascript
  export function broadcastToKey(key, data, sender = null) {
    const payload = JSON.stringify(data);
    const clients = getClientsForKey(key);
    for (const client of clients) {
      if (client.readyState === 1 && client !== sender) {
        client.send(payload);
      }
    }
  }
  ```
- **[`handlers/onMessage/handleCall.js`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/ws/v2/handlers/onMessage/handleCall.js)**: Processes incoming token calls and routes them strictly to matched displays.

---

## 3. Case Study: The "Ghost Socket" Bug & Dynamic Room Switching

### The Symptom
During live testing, changing the room key on a display (e.g., from `101` to `102`) caused calls sent to Room `101` to still play sound on the display!

### Root Cause Analysis
1. **Asynchronous TCP Teardown**: When the frontend called `socket.close()`, TCP teardown was scheduled asynchronously.
2. **Lingering Listeners**: The old socket's `onmessage` listener was still attached to the window during closing.
3. **Server Registry Delay**: Until the server received the TCP close frame, the old socket remained registered under Room `101` in Node's memory.
4. **Reconnection Cascading**: The old socket's `onclose` fired upon closing, triggering `setTimeout(connect, 2000)` and spawning ghost connections.

### The Solution: Zero-Latency In-Place Switching
Instead of tearing down connections when changing rooms, the frontend emits a lightweight control frame:
```javascript
socket.send(JSON.stringify({ type: "setKey", key: newKey, role: "display" }));
```

In [`handleSetKey.js`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/ws/v2/handlers/onMessage/handleSetKey.js):
1. The server moves the existing open socket from the old key set to the new key set in **`0 milliseconds`**.
2. Old presence and new presence are updated.
3. If a socket ever closes, its event handlers are explicitly nullified (`socket.onmessage = null; socket.onclose = null;`) to guarantee no ghost frames can ever execute.

---

## 4. V3 Frontend: Pure Control-Wise Component Architecture

[`public/v3/`](file:///d:/KeshavSoftRepos/nov/21/appointment/appointment-notifier-v1/public/v3/) establishes complete separation of concerns without shared stylesheet pollution:

### 1. Zero Shared CSS
`dr/` and `display/` are 100% self-contained. Neither imports from the other or from a common root style.

### 2. Control-Wise CSS Decomposition
Styles are segmented by page control:
- **`layout.css`**: Page container and responsive viewport setup.
- **`header.css`**: Top navigation, status pill, and station key badge.
- **`keypad.css` / `token.css`**: Core interactive or display controls.
- **`modal.css`**: Station key pairing dialog.

### 3. Pure Functional JavaScript Modules
- **`storage.js`**: Pure getters and setters for `localStorage`.
- **`messages.js`**: Pure message creators returning JSON strings.
- **`dom.js`**: Pure DOM binding functions that update element text and classes based on passed parameters.
- **`teluguWords.js`**: Pure function converting integer numbers (`1` to `999`) to Telugu spelled-out text.
- **`audio.js`**: Standalone Web Audio buffer player for Telugu number announcements.
- **`websocket.js`**: Factory function creating clean socket instances with explicit handler injection.
- **`index.js`**: Orchestrator wiring elements, listeners, and handlers together.
