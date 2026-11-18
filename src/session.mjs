import { randomUUID } from "node:crypto";

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map(part => part.trim().split("=")).filter(([key, value]) => key && value).map(([key, ...value]) => {
    try { return [key, decodeURIComponent(value.join("="))]; } catch { return [key, ""]; }
  }));
}

export function getSessionId(req) {
  const cookies = parseCookies(req.headers?.cookie);
  const existing = cookies.kb_session;
  return existing && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(existing) ? existing : randomUUID();
}

export function sessionCookie(id, secure = process.env.NODE_ENV === "production") {
  return `kb_session=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secure ? "; Secure" : ""}`;
}
