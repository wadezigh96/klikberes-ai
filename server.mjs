import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createTask, approveTask, executeTask, getTask, listTasks, resetTasks
} from "./src/task-engine.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, status, payload, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(payload) : payload);
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch { const error = new Error("Request body must be valid JSON."); error.status = 400; throw error; }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      if (req.method === "GET" && url.pathname === "/api/health") {
        return send(res, 200, { ok: true, app: "KlikBeres AI", version: "0.1.0" });
      }
      if (req.method === "GET" && url.pathname === "/api/tasks") {
        return send(res, 200, { tasks: listTasks() });
      }
      if (req.method === "POST" && url.pathname === "/api/tasks") {
        return send(res, 201, { task: createTask(await body(req)) });
      }
      if (req.method === "POST" && url.pathname === "/api/demo/reset") {
        resetTasks();
        return send(res, 200, { ok: true });
      }
      const match = url.pathname.match(/^\/api\/tasks\/([a-zA-Z0-9_-]+)\/(approve|execute)$/);
      if (match && req.method === "POST") {
        const [, id, action] = match;
        const task = action === "approve" ? approveTask(id) : executeTask(id, await body(req));
        return send(res, 200, { task });
      }
      const getMatch = url.pathname.match(/^\/api\/tasks\/([a-zA-Z0-9_-]+)$/);
      if (getMatch && req.method === "GET") {
        const task = getTask(getMatch[1]);
        return task ? send(res, 200, { task }) : send(res, 404, { error: { code: "NOT_FOUND", message: "Task not found." } });
      }
      return send(res, 404, { error: { code: "NOT_FOUND", message: "API route not found." } });
    }

    const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1));
    const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
    const path = join(publicDir, safePath);
    if (!path.startsWith(publicDir)) return send(res, 403, "Forbidden", "text/plain");
    try {
      const content = await readFile(path);
      return send(res, 200, content, mime[extname(path)] || "application/octet-stream");
    } catch {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
  } catch (error) {
    const status = error.status || (error.code === "NOT_FOUND" ? 404 : 422);
    return send(res, status, { error: { code: error.code || "REQUEST_FAILED", message: error.message || "Request failed." } });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`KlikBeres AI running at http://localhost:${port}`);
});

export { server };
