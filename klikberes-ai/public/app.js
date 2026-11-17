const $ = (selector) => document.querySelector(selector);
const taskInput = $("#task-input");
const taskList = $("#task-list");
const errorBox = $("#form-error");
const toast = $("#toast");
let tasks = [];

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "Something went wrong.");
  return payload;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function statusLabel(status) {
  return ({ awaiting_approval: "Awaiting approval", approved: "Approved", completed: "Completed" })[status] || status;
}

function render() {
  $("#task-count").textContent = String(tasks.length);
  if (!tasks.length) {
    taskList.innerHTML = `<div class="empty-state"><div class="empty-icon">✳</div><strong>Your next task starts here</strong><p>Describe something you want done and KlikBeres will turn it into a clear plan.</p></div>`;
    return;
  }
  taskList.innerHTML = tasks.map(task => `
    <article class="task-card" data-task-id="${escapeHtml(task.id)}">
      <div class="task-top">
        <div class="task-icon">✳</div>
        <div class="task-info"><h3>${escapeHtml(task.title)}</h3><div class="task-meta">${escapeHtml(task.id)} · Created ${new Date(task.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div></div>
        <span class="status ${task.status === "completed" ? "completed" : task.status === "approved" ? "approved" : ""}">${statusLabel(task.status)}</span>
      </div>
      <div class="plan">${task.plan.map((step, index) => `
        <div class="plan-step"><span class="step-dot">${index + 1}</span><div><strong>${escapeHtml(step.label)}</strong><small>${escapeHtml(step.detail)}</small></div></div>
      `).join("")}</div>
      ${task.status === "awaiting_approval" ? `<div class="task-actions"><button class="approve-button" data-action="approve" data-id="${escapeHtml(task.id)}">Approve plan ✓</button><button class="secondary-button" data-action="cancel" data-id="${escapeHtml(task.id)}">Keep for later</button></div>` : ""}
      ${task.status === "approved" ? `
        <div class="demo-form">
          <div class="section-kicker">LOCAL DEMO BROWSER · SAMPLE FORM</div>
          <form class="local-demo-form" data-task-id="${escapeHtml(task.id)}">
            <div class="demo-fields">
              <label>Full name<input name="fullName" required value="Alya Pratama" aria-label="Demo full name"></label>
              <label>Email<input name="email" type="email" required value="alya.demo@example.com" aria-label="Demo email"></label>
            </div>
            <label class="purpose-label">Purpose<input name="purpose" required value="Community volunteer registration" aria-label="Demo purpose"></label>
            <div class="demo-submit">Local-only demo. No external website will be contacted.</div>
            <div class="task-actions" style="margin:12px 0 0"><button class="approve-button" type="submit">Run approved task ↗</button></div>
          </form>
        </div>` : ""}
      ${task.status === "completed" && task.evidence ? `
        <div class="evidence"><strong>✓ Verified evidence</strong><p>Sample registration form completed. The result was checked and recorded locally.</p><code>External submission: ${task.evidence.submittedToExternalWebsite ? "YES" : "NO"} · Verified: ${task.evidence.verified ? "YES" : "NO"}</code></div>` : ""}
    </article>
  `).join("");
}

async function refresh() {
  const result = await api("/api/tasks");
  tasks = result.tasks;
  render();
}

$("#create-task").addEventListener("click", async () => {
  errorBox.textContent = "";
  try {
    const result = await api("/api/tasks", { method: "POST", body: JSON.stringify({ title: taskInput.value }) });
    taskInput.value = "";
    tasks.unshift(result.task);
    render();
    notify("Your plan is ready for review.");
  } catch (error) { errorBox.textContent = error.message; }
});

taskInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) $("#create-task").click();
});

document.querySelectorAll(".suggestion-chip").forEach(button => {
  button.addEventListener("click", () => {
    taskInput.value = button.dataset.prompt;
    taskInput.focus();
  });
});

taskList.addEventListener("submit", async event => {
  const form = event.target.closest("form.local-demo-form");
  if (!form) return;
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  const values = Object.fromEntries(new FormData(form).entries());
  try {
    const result = await api(`/api/tasks/${form.dataset.taskId}/execute`, {
      method: "POST", body: JSON.stringify(values)
    });
    tasks = tasks.map(task => task.id === form.dataset.taskId ? result.task : task);
    render();
    notify("Local task completed and evidence recorded.");
  } catch (error) {
    button.disabled = false;
    notify(error.message);
  }
});

taskList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  button.disabled = true;
  try {
    if (action === "approve") {
      const result = await api(`/api/tasks/${id}/approve`, { method: "POST", body: "{}" });
      tasks = tasks.map(task => task.id === id ? result.task : task);
      notify("Plan approved. You are in control.");
    } else if (action === "cancel") {
      notify("Task kept in your workspace.");
    }
    render();
  } catch (error) {
    button.disabled = false;
    notify(error.message);
  }
});

$("#reset-demo").addEventListener("click", async () => {
  await api("/api/demo/reset", { method: "POST", body: "{}" });
  tasks = [];
  render();
  notify("Demo workspace reset.");
});

$("#how-it-works").addEventListener("click", () => {
  document.querySelector(".welcome").scrollIntoView({ behavior: "smooth" });
  notify("Describe → Review → Approve → Run → Verify.");
});

$("#language-toggle").addEventListener("click", () => notify("English / Bahasa Indonesia: language selector preview."));

refresh().catch(error => notify(error.message));
