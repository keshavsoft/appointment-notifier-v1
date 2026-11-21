# 📖 The Story & Evolution of CareCall

From a single-broadcast clinic prototype to a resilient, multi-station keyed queue platform.

---

## Chapter 1: The Beauty and The Wall of V1

CareCall began with a clear purpose: eliminate noisy clinic waiting rooms by broadcasting doctor calls to smart TVs with clear Telugu voice announcements.

In **V1**, the architecture was delightfully simple:
- When a doctor pressed a token number, the WebSocket server broadcasted it to `wss.clients`.
- Every connected TV in the clinic picked it up and sounded the bell.

**The Wall**: As soon as a clinic expanded beyond one doctor, V1 broke down:
- Doctor in Room 1 (ENT) called Token 5.
- Doctor in Room 2 (Dental) called Token 12.
- Both waiting TVs clashed, overriding each other's numbers and interrupting announcements.
- A global broadcast could no longer scale.

---

## Chapter 2: The Vision for Targeted Lines

The requirement became clear: **the WebSocket server must speak only with specific connected lines**.

Two design challenges arose:
1. How to achieve targeted messaging without breaking existing hardware.
2. How to iterate aggressively without jeopardizing the rock-solid V1 baseline.

The answer was the **Pluggable Engine Architecture**:
- Keep `ws/v1/` completely frozen and intact.
- Build `ws/v2/` as the experimental playground for targeted lines.
- In `app.js`, maintain a single-variable switch to hook whichever engine is desired, while the client endpoint remains permanently invariant at `/ws`.

---

## Chapter 3: The Station Key Breakthrough

Instead of burdening doctors and nurses with user registrations, passwords, and database configurations, CareCall introduced **Station Key Pairing**:

- **Doctor Console**: Doctor opens the app, types Station Key `101`.
- **Waiting Area TV**: TV opens the display, types Station Key `101`.
- **Instantly Paired**: They share a dedicated virtual channel with zero cross-talk.
- Room `102` can call tokens all day long, and TV `101` will remain completely insulated.
- **Sender Exclusion**: When Doctor `101` sends Token `42`, the server excludes the sender (`client !== sender`), routing the announcement only to the waiting patients outside.

---

## Chapter 4: Taming the Ghost Socket

During live testing, an intriguing bug appeared:
> *"When I log in with 101, it works. But when I click the badge to alter the room to 102, sound from 101 still plays on the display!"*

Investigation revealed a classic distributed systems challenge:
- Calling `socket.close()` is asynchronous.
- While the old socket was undergoing TCP termination, its event listeners remained in browser memory, and the server still had it indexed under Room `101`.
- Calls from Doctor `101` were still delivered to this ghost socket!

The solution was **Zero-Latency In-Place Switching**:
- The client emits `{ type: "setKey", key: "102" }`.
- The server re-indexes the socket instantaneously without disconnecting.
- Socket listeners are explicitly detached, and active display state is wiped clean in `0ms`.
- The result: instant, glitch-free room switching.

---

## Chapter 5: The Quest for Purity (V3 Frontend)

Once the backend pairing engine was perfected, attention turned to code aesthetics and architectural purity in **V3**:

- **No Shared CSS**: No global CSS leaks. Both `dr/` and `display/` are 100% self-contained.
- **Control-Wise CSS**: Split by UI region (`header.css`, `keypad.css`, `token.css`, `infoCard.css`, `modal.css`).
- **Pure Functional JavaScript**: Every utility function is pure, with zero hidden side-effects or inline event bindings.
- **Zero Comments**: Folder names, file names, and function names tell the entire story on their own.

---

## Chapter 6: Production Readiness

CareCall was finalized with:
- Native `.env` file loading via `process.loadEnvFile()`.
- Dynamic cloud `process.env.PORT` resolution for one-click publishing.
- Automatic HTTPS / WSS upgrade negotiation.

CareCall stands ready for production deployment across clinics and hospitals worldwide.
