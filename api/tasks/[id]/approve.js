import { context, approveTask, method } from "../../_shared.mjs";

export default async function handler(req, res) {
  const ownerId = context(req, res);
  if (req.method !== "POST") return method(res, ["POST"]);
  try { return res.status(200).json({ task: approveTask(req.query.id, ownerId) }); }
  catch (error) { return res.status(error.code === "NOT_FOUND" ? 404 : 422).json({ error: error.message }); }
}
