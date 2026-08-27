-- Stores detailed phishing/scam analyses for authenticated users.
-- Guest "quick" scans are never persisted.
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message_text text not null,
  risk_score integer not null check (risk_score >= 0 and risk_score <= 100),
  risk_level text not null check (risk_level in ('low', 'suspicious', 'high', 'very_high')),
  classification text not null,
  summary text not null,
  warning_signs jsonb not null default '[]'::jsonb,
  risk_breakdown jsonb not null default '{}'::jsonb,
  social_engineering jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  detected_urls jsonb not null default '[]'::jsonb,
  recommended_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

-- The backend uses the service role key (which bypasses RLS) for all writes/reads,
-- but RLS is still enabled here in case the table is ever queried directly with a user JWT.
create policy "Users can view their own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);
