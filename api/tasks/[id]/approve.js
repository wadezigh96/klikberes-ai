import { executeTask } from "../../../src/task-engine.mjs";

// In-memory store shared via module scope is limited on serverless.
// For the demo we keep a simple module-level map (same instance only).
const tasks = globalThis.__KLIKBERES_TASKS || new Map();
globalThis.__KLIKBERES_TASKS = tasks;

export default async function handler(req, res) {
  const { id } = req.query;
  const task = tasks.get(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (req.method === "POST") {
    task.status = "approved";
    task.approvedAt = new Date().toISOString();
    tasks.set(id, task);
    return res.status(200).json(task);
  }

  res.status(405).json({ error: "Method not allowed" });
}
