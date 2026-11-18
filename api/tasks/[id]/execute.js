import { context, errorResponse, executeTask, limitedBody, method } from "../../_shared.mjs";

export default async function handler(req, res) {
  const ownerId = context(req, res);
  if (req.method !== "POST") return method(res, ["POST"]);
  try { return res.status(200).json({ task: await executeTask(req.query.id, limitedBody(req), ownerId) }); }
  catch (error) { return errorResponse(res, error); }
}
