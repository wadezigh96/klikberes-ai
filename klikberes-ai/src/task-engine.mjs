let tasks = [];
let sequence = 0;

export function normalizeRequest(input) {
  const title = String(input?.title ?? "").trim();
  if (!title) throw new Error("Tell KlikBeres what you want done.");
  if (title.length > 180) throw new Error("Task description must be 180 characters or fewer.");
  return title;
}

export function buildPlan(title) {
  const lower = title.toLowerCase();
  const isRegistration = /form|daftar|registration|register|signup|sign up/.test(lower);
  return [
    { id: "understand", label: "Understand the request", detail: "Convert your request into a clear, reviewable plan." },
    { id: "prepare", label: "Prepare the information", detail: isRegistration ? "Use sample profile data in the local demo form." : "Prepare a safe preview of the requested action." },
    { id: "approval", label: "Wait for your approval", detail: "Nothing is submitted before you approve it." },
    { id: "execute", label: "Run the approved task", detail: "Perform the action only in the KlikBeres demo workspace." },
    { id: "verify", label: "Verify the outcome", detail: "Check the resulting state and save an evidence record." }
  ];
}

export function createTask(input) {
  const title = normalizeRequest(input);
  const task = {
    id: `KB-${String(++sequence).padStart(4, "0")}`,
    title,
    status: "awaiting_approval",
    plan: buildPlan(title),
    createdAt: new Date().toISOString(),
    approvedAt: null,
    completedAt: null,
    evidence: null
  };
  tasks = [task, ...tasks];
  return structuredClone(task);
}

export function approveTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) throw Object.assign(new Error("Task not found."), { code: "NOT_FOUND" });
  if (task.status !== "awaiting_approval") throw new Error("Only tasks awaiting approval can be approved.");
  task.status = "approved";
  task.approvedAt = new Date().toISOString();
  return structuredClone(task);
}

export function executeTask(id, input = {}) {
  const task = tasks.find(item => item.id === id);
  if (!task) throw Object.assign(new Error("Task not found."), { code: "NOT_FOUND" });
  if (task.status !== "approved") throw new Error("Approve the task before execution.");
  const fields = {
    fullName: String(input.fullName ?? "").trim(),
    email: String(input.email ?? "").trim(),
    purpose: String(input.purpose ?? "").trim()
  };
  if (!fields.fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    throw new Error("Enter a full name and a valid email before running the demo.");
  }
  task.status = "completed";
  task.completedAt = new Date().toISOString();
  task.evidence = {
    environment: "KlikBeres local demo",
    action: "Local demo registration form submitted",
    submittedToExternalWebsite: false,
    fields,
    verified: true,
    verifiedAt: new Date().toISOString()
  };
  return structuredClone(task);
}

export function getTask(id) {
  const task = tasks.find(item => item.id === id);
  return task ? structuredClone(task) : null;
}

export function listTasks() {
  return structuredClone(tasks);
}

export function resetTasks() {
  tasks = [];
  sequence = 0;
}
