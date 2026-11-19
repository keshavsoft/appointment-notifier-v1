import http from "node:http";
import { fileURLToPath } from "node:url";
import sirv from "sirv";
import { attachWebSocketServer } from "./ws/attachWebSocketServer.js";

const PORT = Number(process.env.PORT) || 3000;
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
  if (path === "/tv" || path === "/tv/") req.url = "/tv/index.html";
  else if (path === "/mobile" || path === "/mobile/") req.url = "/mobile/index.html";
  else if (path === "/desktop" || path === "/desktop/") req.url = "/desktop/index.html";

  serveStatic(req, res);
});

// Attach the real-time clinic WebSocket subsystem
attachWebSocketServer(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CareCall V1 Server listening on http://0.0.0.0:${PORT}`);
});
