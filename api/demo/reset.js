import { context, errorResponse, limitedBody, method, resetTasks } from "../../_shared.mjs";

export default async function handler(req, res) {
  const ownerId = context(req, res);
  if (req.method !== "POST") return method(res, ["POST"]);
  try {
    limitedBody(req);
    await resetTasks(ownerId);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return errorResponse(res, error);
  }
}
