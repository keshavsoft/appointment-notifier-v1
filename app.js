import http from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";
// ============================================================================
// WEBSOCKET BACKEND ENGINE HOOK
// Frontends (TV, Mobile, Desktop) connect to /ws without needing to know versions.
// Switch the active backend engine implementation below (v1 or v2):
// ============================================================================
import { attachWebSocketServer as attachV1 } from "./ws/v1/attachWebSocketServer.js";
import { attachWebSocketServer as attachV2 } from "./ws/v2/attachWebSocketServer.js";

// Hook your chosen engine here: attachV1 (classic broadcast) or attachV2 (targeted lines)
const attachWebSocketServer = attachV2;

const PORT = Number(process.env.PORT) || 3001;
const publicDir = fileURLToPath(new URL("./public/", import.meta.url));

const serveStatic = sirv(publicDir, {
  dev: true,
  extensions: ["html"],
  setHeaders(res) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
  }
});

const server = http.createServer((req, res) => {
  const host = req.headers.host || "127.0.0.1";
  const proto = req.headers["x-forwarded-proto"] || "http";
  let path = "/";
  try {
    path = new URL(req.url, `${proto}://${host}`).pathname;
  } catch {
    path = req.url || "/";
  }

  // Clean, declarative route mapping
  if (path === "/v1" || path === "/v1/") req.url = "/v1/index.html";
  else if (path === "/v2" || path === "/v2/") req.url = "/v2/index.html";
  else if (path === "/tv" || path === "/tv/") req.url = "/tv/index.html";
  else if (path === "/mobile" || path === "/mobile/") req.url = "/mobile/index.html";
  else if (path === "/desktop" || path === "/desktop/") req.url = "/desktop/index.html";

  serveStatic(req, res);
});

// Attach the real-time clinic WebSocket subsystem
attachWebSocketServer(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CareCall Server listening on http://0.0.0.0:${PORT}`);
});
