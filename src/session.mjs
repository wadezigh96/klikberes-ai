import { randomUUID } from "node:crypto";

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map(part => part.trim().split("=")).filter(([key, value]) => key && value).map(([key, ...value]) => [key, decodeURIComponent(value.join("="))]));
}

export function getSessionId(req) {
  const cookies = parseCookies(req.headers?.cookie);
  const existing = cookies.kb_session;
  return existing && /^[a-f0-9-]{36}$/.test(existing) ? existing : randomUUID();
}

export function sessionCookie(id, secure = process.env.NODE_ENV === "production") {
  return `kb_session=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure ? "; Secure" : ""}`;
}
