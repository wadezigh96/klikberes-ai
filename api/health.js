export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    ok: true,
    app: "KlikBeres AI",
    version: "0.1.0",
    time: new Date().toISOString()
  });
}
