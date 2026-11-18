import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { normalizeRequest, buildPlan, createTask, approveTask, executeTask, getTask, listTasks, resetTasks, resetAllTasks } from "../src/task-engine.mjs";

beforeEach(() => resetAllTasks());

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
  assert.throws(() => executeTask(task.id, {}, "user-a"), /Approve the task/);
});

test("isolates tasks by owner", async () => {
  const task = await createTask({ title: "Prepare a form" }, "user-a");
  assert.equal(listTasks("user-b").length, 0);
  assert.equal(getTask(task.id, "user-b"), null);
  assert.throws(() => approveTask(task.id, "user-b"), /Task not found/);
});

test("requires approval and records safe local evidence", async () => {
  const task = await createTask({ title: "Fill the demo registration form" }, "user-a");
  const approved = approveTask(task.id, "user-a");
  assert.equal(approved.status, "approved");
  const completed = executeTask(task.id, { fullName: "Rani Example", email: "rani@example.com", purpose: "Volunteer application" }, "user-a");
  assert.equal(completed.status, "completed");
  assert.equal(completed.evidence.verified, true);
  assert.equal(completed.evidence.submittedToExternalWebsite, false);
});

test("rejects invalid and oversized form data", async () => {
  const task = await createTask({ title: "Fill the demo registration form" }, "user-a");
  approveTask(task.id, "user-a");
  assert.throws(() => executeTask(task.id, { fullName: "Rani", email: "not-an-email", purpose: "x" }, "user-a"), /valid email/);
  assert.throws(() => executeTask(task.id, { fullName: "x".repeat(201), email: "a@example.com", purpose: "x" }, "user-a"), /200 characters/);
});

test("supports the documented buildPlan name", () => {
  assert.deepEqual(buildPlan("Register for a community event").map(step => step.id), ["understand", "prepare", "approval", "execute", "verify"]);
});

test("reset only removes the current owner's tasks", async () => {
  await createTask({ title: "A" }, "user-a");
  await createTask({ title: "B" }, "user-b");
  resetTasks("user-a");
  assert.equal(listTasks("user-a").length, 0);
  assert.equal(listTasks("user-b").length, 1);
});
