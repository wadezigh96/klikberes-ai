import { createPlan, executeTask } from "../src/task-engine.mjs";

const tasks = new Map();

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ tasks: Array.from(tasks.values()) });
  }

  if (req.method === "POST") {
    const { title, description } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: "title and description required" });
    }

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const plan = createPlan(description);
    const task = {
      id,
      title,
      description,
      status: "awaiting_approval",
      plan,
      evidence: null,
      createdAt: new Date().toISOString(),
    };
    tasks.set(id, task);
    return res.status(201).json(task);
  }

  res.status(405).json({ error: "Method not allowed" });
}
