import { executeTask } from "../../../src/task-engine.mjs";

const tasks = globalThis.__KLIKBERES_TASKS || new Map();
globalThis.__KLIKBERES_TASKS = tasks;

export default async function handler(req, res) {
  const { id } = req.query;
  const task = tasks.get(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (task.status !== "approved") {
    return res.status(403).json({ error: "Task must be approved first" });
  }

  if (req.method === "POST") {
    const result = executeTask(task);
    task.status = "completed";
    task.evidence = result.evidence;
    task.completedAt = new Date().toISOString();
    tasks.set(id, task);
    return res.status(200).json(task);
  }

  res.status(405).json({ error: "Method not allowed" });
}
