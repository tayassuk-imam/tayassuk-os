-- Tayassuk OS — fresh Supabase project setup
-- Run once in the SQL Editor of the NEW project.
-- Public visitors can read the portfolio. Only the owner email below can write.

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
to anon, authenticated
using (true);

drop policy if exists "Only owner can manage portfolio" on public.portfolio_content;
create policy "Only owner can manage portfolio"
on public.portfolio_content
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'tayassuk101@gmail.com')
with check ((auth.jwt() ->> 'email') = 'tayassuk101@gmail.com');

-- The CMS uploads achievement certificates to the 'certificates' bucket.
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view certificates" on storage.objects;
create policy "Public can view certificates"
on storage.objects
for select
to public
using (bucket_id = 'certificates');

drop policy if exists "Only owner can manage certificates" on storage.objects;
create policy "Only owner can manage certificates"
on storage.objects
for all
to authenticated
using (bucket_id = 'certificates' and (auth.jwt() ->> 'email') = 'tayassuk101@gmail.com')
with check (bucket_id = 'certificates' and (auth.jwt() ->> 'email') = 'tayassuk101@gmail.com');
