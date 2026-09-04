-- Tayassuk OS one-time Supabase setup.
-- Run this in Supabase SQL Editor.

create table if not exists public.portfolio_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "Public can read portfolio" on public.portfolio_content;
create policy "Public can read portfolio"
on public.portfolio_content
for select
using (true);

drop policy if exists "Signed in admins can write portfolio" on public.portfolio_content;
create policy "Signed in admins can write portfolio"
on public.portfolio_content
for all
to authenticated
using (true)
with check (true);

-- Optional public storage bucket for future CV/avatar/project images.
insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view portfolio assets" on storage.objects;
create policy "Public can view portfolio assets"
on storage.objects
for select
to public
using (bucket_id = 'portfolio-assets');

drop policy if exists "Signed in admins can manage portfolio assets" on storage.objects;
create policy "Signed in admins can manage portfolio assets"
on storage.objects
for all
to authenticated
using (bucket_id = 'portfolio-assets')
with check (bucket_id = 'portfolio-assets');
