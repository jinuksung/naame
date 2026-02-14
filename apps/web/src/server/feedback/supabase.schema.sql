create table if not exists public.name_feedback_stats (
  name_key text primary key,
  surname_hangul text not null default '',
  surname_hanja text not null default '',
  name_hangul text not null,
  likes integer not null default 0 check (likes >= 0),
  dislikes integer not null default 0 check (dislikes >= 0),
  updated_at timestamptz not null default now()
);

alter table if exists public.name_feedback_stats
  add column if not exists surname_hangul text not null default '';

alter table if exists public.name_feedback_stats
  add column if not exists surname_hanja text not null default '';

create index if not exists idx_name_feedback_stats_surname_name_hangul
  on public.name_feedback_stats (surname_hangul, name_hangul);

drop function if exists public.record_name_feedback_vote(text, text, text);

create or replace function public.record_name_feedback_vote(
  p_surname_hangul text,
  p_surname_hanja text,
  p_name_key text,
  p_name_hangul text,
  p_vote text
)
returns void
language plpgsql
security definer
as $$
begin
  if p_vote not in ('like', 'dislike') then
    raise exception 'invalid vote type: %', p_vote;
  end if;

  insert into public.name_feedback_stats (
    name_key,
    surname_hangul,
    surname_hanja,
    name_hangul,
    likes,
    dislikes,
    updated_at
  )
  values (
    p_name_key,
    p_surname_hangul,
    p_surname_hanja,
    p_name_hangul,
    case when p_vote = 'like' then 1 else 0 end,
    case when p_vote = 'dislike' then 1 else 0 end,
    now()
  )
  on conflict (name_key)
  do update set
    surname_hangul = excluded.surname_hangul,
    surname_hanja = excluded.surname_hanja,
    likes = public.name_feedback_stats.likes + case when p_vote = 'like' then 1 else 0 end,
    dislikes = public.name_feedback_stats.dislikes + case when p_vote = 'dislike' then 1 else 0 end,
    updated_at = now();
end;
$$;

create or replace function public.get_name_feedback_stats(name_keys text[])
returns table (
  name_key text,
  likes integer,
  dislikes integer
)
language sql
security definer
as $$
  select
    s.name_key,
    s.likes,
    s.dislikes
  from public.name_feedback_stats s
  where s.name_key = any (name_keys);
$$;

drop function if exists public.get_name_feedback_stats_by_hangul(text, text[]);

create or replace function public.get_name_feedback_stats_by_hangul(
  p_surname_hangul text,
  p_name_hanguls text[]
)
returns table (
  surname_hangul text,
  name_hangul text,
  likes integer,
  dislikes integer
)
language sql
security definer
as $$
  select
    s.surname_hangul,
    s.name_hangul,
    sum(s.likes)::integer as likes,
    sum(s.dislikes)::integer as dislikes
  from public.name_feedback_stats s
  where s.surname_hangul = coalesce(trim(p_surname_hangul), '')
    and s.name_hangul = any (p_name_hanguls)
  group by s.surname_hangul, s.name_hangul;
$$;
