create table if not exists tasks (
  id text primary key,
  owner_id text not null,
  title varchar(180) not null,
  status text not null check (status in ('awaiting_approval', 'approved', 'completed')),
  plan jsonb not null,
  plan_source text not null check (plan_source in ('local', 'llm')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  completed_at timestamptz,
  evidence jsonb
);

create index if not exists tasks_owner_created_idx on tasks (owner_id, created_at desc);
create index if not exists tasks_owner_status_idx on tasks (owner_id, status);
