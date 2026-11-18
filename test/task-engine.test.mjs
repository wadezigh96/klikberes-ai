import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { normalizeRequest, buildPlan, validPlan, createTask, approveTask, executeTask, getTask, listTasks, resetTasks, resetAllTasks } from "../src/task-engine.mjs";
import { getSessionId } from "../src/session.mjs";

beforeEach(async () => resetAllTasks());

test("rejects an empty or oversized request", () => {
  assert.throws(() => normalizeRequest({ title: "   " }), /Tell KlikBeres/);
  assert.throws(() => normalizeRequest({ title: "x".repeat(181) }), /180 characters/);
});

test("creates exactly the safe five-step plan", async () => {
  const task = await createTask({ title: "Fill the demo registration form" }, "user-a");
  assert.equal(task.status, "awaiting_approval");
  assert.deepEqual(task.plan.map(step => step.id), ["understand", "prepare", "approval", "execute", "verify"]);
  assert.equal(task.planSource, "local");
  assert.equal(task.approvedAt, null);
});

test("does not allow execution before explicit approval", async () => {
  const task = await createTask({ title: "Fill the demo registration form" }, "user-a");
  await assert.rejects(() => executeTask(task.id, {}, "user-a"), /Approve the task/);
});

test("isolates tasks by owner", async () => {
  const task = await createTask({ title: "Prepare a form" }, "user-a");
  assert.equal((await listTasks("user-b")).length, 0);
  assert.equal(await getTask(task.id, "user-b"), null);
  await assert.rejects(() => approveTask(task.id, "user-b"), /Task not found/);
});

test("requires approval and records safe local evidence", async () => {
  const task = await createTask({ title: "Fill the demo registration form" }, "user-a");
  const approved = await approveTask(task.id, "user-a");
  assert.equal(approved.status, "approved");
  const completed = await executeTask(task.id, { fullName: "Rani Example", email: "rani@example.com", purpose: "Volunteer application" }, "user-a");
  assert.equal(completed.status, "completed");
  assert.equal(completed.evidence.verified, true);
  assert.equal(completed.evidence.submittedToExternalWebsite, false);
});

test("rejects invalid and oversized form data", async () => {
  const task = await createTask({ title: "Fill the demo registration form" }, "user-a");
  await approveTask(task.id, "user-a");
  await assert.rejects(() => executeTask(task.id, { fullName: "Rani", email: "not-an-email", purpose: "x" }, "user-a"), /valid email/);
  await assert.rejects(() => executeTask(task.id, { fullName: "x".repeat(201), email: "a@example.com", purpose: "x" }, "user-a"), /200 characters/);
});

test("supports the documented buildPlan name", () => {
  assert.deepEqual(buildPlan("Register for a community event").map(step => step.id), ["understand", "prepare", "approval", "execute", "verify"]);
});

test("accepts only LLM plans that preserve the safety gate", () => {
  const safe = buildPlan("Fill the demo registration form");
  assert.equal(validPlan(safe), true);
  assert.equal(validPlan(safe.map((step, index) => index === 2 ? { ...step, detail: "Submit immediately without approval." } : step)), false);
  assert.equal(validPlan(safe.map((step, index) => index === 3 ? { ...step, detail: "Submit the form to the external website." } : step)), false);
});

test("ignores malformed session cookies instead of throwing", () => {
  const id = getSessionId({ headers: { cookie: "kb_session=%E0%A4%A" } });
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("reset only removes the current owner's tasks", async () => {
  await createTask({ title: "A" }, "user-a");
  await createTask({ title: "B" }, "user-b");
  await resetTasks("user-a");
  assert.equal((await listTasks("user-a")).length, 0);
  assert.equal((await listTasks("user-b")).length, 1);
});
