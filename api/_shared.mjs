import { createTask, approveTask, executeTask, getTask, listTasks, resetTasks } from "../src/task-engine.mjs";
import { getSessionId, sessionCookie } from "../src/session.mjs";

export function context(req, res) {
  const ownerId = getSessionId(req);
  res.setHeader("Set-Cookie", sessionCookie(ownerId, true));
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; base-uri 'none'; frame-ancestors 'none'");
  return ownerId;
}
export function limitedBody(req) {
  const body = req.body || {};
  if (Buffer.byteLength(JSON.stringify(body)) > 16 * 1024) throw Object.assign(new Error("Request body is too large."), { code: "PAYLOAD_TOO_LARGE" });
  return body;
}
export function method(res, allowed) { res.setHeader("Allow", allowed.join(", ")); return res.status(405).json({ error: "Method not allowed" }); }
export function errorResponse(res, error) {
  const status = error.code === "NOT_FOUND" ? 404 : error.code === "PAYLOAD_TOO_LARGE" ? 413 : 422;
  return res.status(status).json({ error: { code: error.code || "REQUEST_FAILED", message: error.message || "Request failed." } });
}
export { createTask, approveTask, executeTask, getTask, listTasks, resetTasks };
