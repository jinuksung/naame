create table if not exists public.name_feedback_stats (
  name_key text primary key,
  name_hangul text not null,
  likes integer not null default 0 check (likes >= 0),
  dislikes integer not null default 0 check (dislikes >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.record_name_feedback_vote(
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
    name_hangul,
    likes,
    dislikes,
    updated_at
  )
  values (
    p_name_key,
    p_name_hangul,
    case when p_vote = 'like' then 1 else 0 end,
    case when p_vote = 'dislike' then 1 else 0 end,
    now()
  )
  on conflict (name_key)
  do update set
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
