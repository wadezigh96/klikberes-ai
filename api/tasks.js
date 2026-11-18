import { context, createTask, errorResponse, limitedBody, listTasks, method } from "./_shared.mjs";

export default async function handler(req, res) {
  const ownerId = context(req, res);
  if (req.method === "GET") return res.status(200).json({ tasks: await listTasks(ownerId) });
  if (req.method === "POST") {
    try { return res.status(201).json({ task: await createTask(limitedBody(req), ownerId) }); }
    catch (error) { return errorResponse(res, error); }
  }
  return method(res, ["GET", "POST"]);
}
