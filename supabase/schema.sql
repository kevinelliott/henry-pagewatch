-- PageWatch Schema

-- Profiles
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'business')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  pages_limit int not null default 3,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = id);

-- Monitored pages
create table if not exists monitored_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  url text not null,
  name text not null,
  check_frequency text not null default 'daily' check (check_frequency in ('hourly', 'daily', 'weekly')),
  status text not null default 'active' check (status in ('active', 'paused', 'error')),
  css_selector text,
  ignore_patterns text[],
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  content_hash text,
  check_count int not null default 0,
  change_count int not null default 0,
  error_message text,
  next_check_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table monitored_pages enable row level security;
create policy "Users manage own pages" on monitored_pages for all using (auth.uid() = user_id);

-- Page snapshots
create table if not exists page_snapshots (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references monitored_pages(id) on delete cascade not null,
  content_hash text not null,
  content_text text,
  content_length int not null default 0,
  created_at timestamptz not null default now()
);

alter table page_snapshots enable row level security;
create policy "Users view own snapshots" on page_snapshots for select
  using (exists (select 1 from monitored_pages mp where mp.id = page_id and mp.user_id = auth.uid()));
create policy "Service role insert snapshots" on page_snapshots for insert
  with check (true);

-- Page changes
create table if not exists page_changes (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references monitored_pages(id) on delete cascade not null,
  old_snapshot_id uuid references page_snapshots(id),
  new_snapshot_id uuid references page_snapshots(id) not null,
  diff_summary text,
  lines_added int not null default 0,
  lines_removed int not null default 0,
  status text not null default 'unread' check (status in ('unread', 'read')),
  detected_at timestamptz not null default now()
);

alter table page_changes enable row level security;
create policy "Users manage own changes" on page_changes for all
  using (exists (select 1 from monitored_pages mp where mp.id = page_id and mp.user_id = auth.uid()));

-- Alert configs
create table if not exists alert_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  page_id uuid references monitored_pages(id) on delete cascade,
  type text not null check (type in ('email', 'webhook')),
  email text,
  webhook_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table alert_configs enable row level security;
create policy "Users manage own alerts" on alert_configs for all using (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Indexes
create index if not exists idx_monitored_pages_user_id on monitored_pages(user_id);
create index if not exists idx_monitored_pages_next_check on monitored_pages(next_check_at) where status = 'active';
create index if not exists idx_page_changes_page_id on page_changes(page_id);
create index if not exists idx_page_changes_status on page_changes(status);
create index if not exists idx_page_snapshots_page_id on page_snapshots(page_id);
