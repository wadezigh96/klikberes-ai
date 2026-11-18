import { randomUUID } from "node:crypto";
import { generatePlanWithLLM } from "./llm.mjs";
import { approveStoredTask, completeStoredTask, deleteTasks, findTask, insertTask, listTasks as listStoredTasks, clearMemory } from "./task-store.mjs";

const PLAN_IDS = ["understand", "prepare", "approval", "execute", "verify"];
const MAX_FIELD = 200;

function error(message, code = "INVALID_REQUEST") {
  return Object.assign(new Error(message), { code });
}

export function normalizeRequest(input) {
  const title = String(input?.title ?? "").trim();
  if (!title) throw error("Tell KlikBeres what you want done.");
  if (title.length > 180) throw error("Task description must be 180 characters or fewer.");
  return title;
}

export function buildLocalPlan(title) {
  const lower = title.toLowerCase();
  const isRegistration = /form|daftar|registration|register|signup|sign up|volunteer|event/.test(lower);
  const isResearch = /research|summary|organize|summarize|notes|info|cari/.test(lower);
  const isEmail = /email|mail|kirim|send/.test(lower);
  const prepareDetail = isRegistration
    ? "Use sample profile data in the local demo form."
    : isResearch
    ? "Gather and structure key points from the request."
    : isEmail
    ? "Draft a safe preview of the message (no sending)."
    : "Prepare a safe preview of the requested action.";
  const executeDetail = isRegistration
    ? "Fill and complete the local demo registration form."
    : "Perform the action only in the KlikBeres demo workspace.";
  return [
    { id: "understand", label: "Understand the request", detail: "Convert your request into a clear, reviewable plan." },
    { id: "prepare", label: "Prepare the information", detail: prepareDetail },
    { id: "approval", label: "Wait for your approval", detail: "Nothing is submitted before you approve it." },
    { id: "execute", label: "Run the approved task", detail: executeDetail },
    { id: "verify", label: "Verify the outcome", detail: "Check the resulting state and save an evidence record." }
  ];
}

export const buildPlan = buildLocalPlan;

function validPlan(plan) {
  return Array.isArray(plan) && plan.length === PLAN_IDS.length && plan.every((step, index) =>
    step && step.id === PLAN_IDS[index] &&
    typeof step.label === "string" && step.label.trim().length > 0 && step.label.length <= 120 &&
    typeof step.detail === "string" && step.detail.trim().length > 0 && step.detail.length <= 400
  );
}

function publicTask(task) {
  if (!task) return null;
  const copy = structuredClone(task);
  delete copy.ownerId;
  return copy;
}

export async function createTask(input, ownerId = "local-demo") {
  const title = normalizeRequest(input);
  const llmPlan = await generatePlanWithLLM(title);
  const useLLM = validPlan(llmPlan);
  const task = {
    id: `KB-${randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`,
    ownerId,
    title,
    status: "awaiting_approval",
    plan: useLLM ? llmPlan : buildLocalPlan(title),
    planSource: useLLM ? "llm" : "local",
    createdAt: new Date().toISOString(),
    approvedAt: null,
    completedAt: null,
    evidence: null
  };
  const stored = await insertTask(task);
  return publicTask(stored);
}

export async function approveTask(id, ownerId = "local-demo") {
  const current = await findTask(id, ownerId);
  if (!current) throw error("Task not found.", "NOT_FOUND");
  if (current.status !== "awaiting_approval") throw error("Only tasks awaiting approval can be approved.");
  const updated = await approveStoredTask(id, ownerId);
  if (!updated) throw error("Only tasks awaiting approval can be approved.");
  return publicTask(updated);
}

export async function executeTask(id, input = {}, ownerId = "local-demo") {
  const current = await findTask(id, ownerId);
  if (!current) throw error("Task not found.", "NOT_FOUND");
  if (current.status !== "approved") throw error("Approve the task before execution.");
  const fields = {
    fullName: String(input.fullName ?? "").trim(),
    email: String(input.email ?? "").trim(),
    purpose: String(input.purpose ?? "").trim()
  };
  if ([fields.fullName, fields.email, fields.purpose].some(value => value.length > MAX_FIELD)) {
    throw error("Form fields must be 200 characters or fewer.");
  }
  if (!fields.fullName || !/^\S+@\S+\.\S+$/.test(fields.email) || !fields.purpose) {
    throw error("Enter a full name, purpose, and valid email before running the demo.");
  }
  const evidence = {
    environment: "KlikBeres local demo",
    action: "Local demo registration form submitted",
    submittedToExternalWebsite: false,
    fields,
    verified: true,
    verifiedAt: new Date().toISOString(),
    planSource: current.planSource
  };
  const updated = await completeStoredTask(id, ownerId, evidence);
  if (!updated) throw error("Approve the task before execution.");
  return publicTask(updated);
}

export async function getTask(id, ownerId = "local-demo") {
  return publicTask(await findTask(id, ownerId));
}

export async function listTasks(ownerId = "local-demo") {
  return (await listStoredTasks(ownerId)).map(publicTask);
}

export async function resetTasks(ownerId = "local-demo") {
  await deleteTasks(ownerId);
}

export async function resetAllTasks() {
  await clearMemory();
}
