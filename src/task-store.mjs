import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
const memory = new Map();

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    status: row.status,
    plan: row.plan,
    planSource: row.plan_source,
    createdAt: new Date(row.created_at).toISOString(),
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    evidence: row.evidence ?? null
  };
}

export function usesDatabase() { return Boolean(sql); }

export async function insertTask(task) {
  if (!sql) { memory.set(task.id, structuredClone(task)); return structuredClone(task); }
  const rows = await sql`
    insert into tasks (id, owner_id, title, status, plan, plan_source, created_at)
    values (${task.id}, ${task.ownerId}, ${task.title}, ${task.status}, ${JSON.stringify(task.plan)}::jsonb, ${task.planSource}, ${task.createdAt})
    returning *
  `;
  return fromRow(rows[0]);
}

export async function findTask(id, ownerId) {
  if (!sql) {
    const task = memory.get(id);
    return task && task.ownerId === ownerId ? structuredClone(task) : null;
  }
  const rows = await sql`select * from tasks where id = ${id} and owner_id = ${ownerId} limit 1`;
  return fromRow(rows[0]);
}

export async function listTasks(ownerId) {
  if (!sql) return [...memory.values()].filter(task => task.ownerId === ownerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(task => structuredClone(task));
  const rows = await sql`select * from tasks where owner_id = ${ownerId} order by created_at desc`;
  return rows.map(fromRow);
}

export async function approveStoredTask(id, ownerId) {
  if (!sql) {
    const task = memory.get(id);
    if (!task || task.ownerId !== ownerId || task.status !== "awaiting_approval") return null;
    task.status = "approved";
    task.approvedAt = new Date().toISOString();
    return structuredClone(task);
  }
  const rows = await sql`
    update tasks set status = 'approved', approved_at = now()
    where id = ${id} and owner_id = ${ownerId} and status = 'awaiting_approval'
    returning *
  `;
  return fromRow(rows[0]);
}

export async function completeStoredTask(id, ownerId, evidence) {
  const completedAt = new Date().toISOString();
  if (!sql) {
    const task = memory.get(id);
    if (!task || task.ownerId !== ownerId || task.status !== "approved") return null;
    task.status = "completed";
    task.completedAt = completedAt;
    task.evidence = structuredClone(evidence);
    return structuredClone(task);
  }
  const rows = await sql`
    update tasks set status = 'completed', completed_at = ${completedAt}, evidence = ${JSON.stringify(evidence)}::jsonb
    where id = ${id} and owner_id = ${ownerId} and status = 'approved'
    returning *
  `;
  return fromRow(rows[0]);
}

export async function deleteTasks(ownerId) {
  if (!sql) {
    for (const [id, task] of memory) if (task.ownerId === ownerId) memory.delete(id);
    return;
  }
  await sql`delete from tasks where owner_id = ${ownerId}`;
}

export async function clearMemory() {
  memory.clear();
}
