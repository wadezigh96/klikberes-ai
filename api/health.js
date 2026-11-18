export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  return res.status(200).json({ ok: true, app: "KlikBeres AI", version: "0.1.0" });
}
