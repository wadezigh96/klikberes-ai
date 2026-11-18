import { context, createTask, limitedBody, listTasks, method } from "./_shared.mjs";

export default async function handler(req, res) {
  const ownerId = context(req, res);
  if (req.method === "GET") return res.status(200).json({ tasks: listTasks(ownerId) });
  if (req.method === "POST") {
    try { return res.status(201).json({ task: await createTask(limitedBody(req), ownerId) }); }
    catch (error) { return res.status(error.code === "NOT_FOUND" ? 404 : 422).json({ error: error.message }); }
  }
  return method(res, ["GET", "POST"]);
}
