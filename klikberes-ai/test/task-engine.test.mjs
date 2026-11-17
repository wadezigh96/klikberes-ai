import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeRequest, buildPlan, createTask, approveTask, executeTask,
  getTask, listTasks, resetTasks
} from "../src/task-engine.mjs";

beforeEach(() => resetTasks());

test("rejects an empty request", () => {
  assert.throws(() => normalizeRequest({ title: "   " }), /Tell KlikBeres/);
});

test("rejects a request longer than 180 characters", () => {
  assert.throws(() => normalizeRequest({ title: "x".repeat(181) }), /180 characters/);
});

test("creates a task with an approval gate and a five-step plan", () => {
  const task = createTask({ title: "Fill the demo registration form" });
  assert.equal(task.status, "awaiting_approval");
  assert.equal(task.plan.length, 5);
  assert.equal(task.approvedAt, null);
  assert.equal(task.evidence, null);
});

test("does not allow execution before explicit approval", () => {
  const task = createTask({ title: "Fill the demo registration form" });
  assert.throws(() => executeTask(task.id), /Approve the task/);
  assert.equal(getTask(task.id).status, "awaiting_approval");
});

test("approval transitions a task to approved", () => {
  const task = createTask({ title: "Fill the demo registration form" });
  const approved = approveTask(task.id);
  assert.equal(approved.status, "approved");
  assert.ok(approved.approvedAt);
});

test("execution records the values submitted through the local demo form", () => {
  const task = createTask({ title: "Fill the demo registration form" });
  approveTask(task.id);
  const completed = executeTask(task.id, {
    fullName: "Rani Example",
    email: "rani@example.com",
    purpose: "Volunteer application"
  });
  assert.equal(completed.status, "completed");
  assert.equal(completed.evidence.verified, true);
  assert.equal(completed.evidence.submittedToExternalWebsite, false);
  assert.equal(completed.evidence.fields.email, "rani@example.com");
  assert.equal(completed.evidence.fields.fullName, "Rani Example");
});

test("rejects invalid local form data without completing the task", () => {
  const task = createTask({ title: "Fill the demo registration form" });
  approveTask(task.id);
  assert.throws(() => executeTask(task.id, { fullName: "Rani", email: "not-an-email" }), /valid email/);
  assert.equal(getTask(task.id).status, "approved");
});

test("prevents approving the same task twice", () => {
  const task = createTask({ title: "Prepare a form" });
  approveTask(task.id);
  assert.throws(() => approveTask(task.id), /awaiting approval/);
});

test("returns null for an unknown task", () => {
  assert.equal(getTask("missing"), null);
});

test("returns defensive copies so callers cannot mutate stored state", () => {
  const task = createTask({ title: "Prepare a form" });
  task.title = "tampered";
  assert.equal(listTasks()[0].title, "Prepare a form");
});

test("creates a reviewable plan for each request", () => {
  const plan = buildPlan("Register for a community event");
  assert.deepEqual(plan.map(step => step.id), ["understand", "prepare", "approval", "execute", "verify"]);
});
