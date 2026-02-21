create or replace function public.touch_ssot_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_ssot_row_index_if_missing()
returns trigger
language plpgsql
as $$
declare
  next_row_index integer;
begin
  if new.row_index is not null then
    return new;
  end if;

  execute format(
    'lock table %I.%I in share row exclusive mode',
    tg_table_schema,
    tg_table_name
  );

  execute format(
    'select coalesce(max(row_index), -1) + 1 from %I.%I',
    tg_table_schema,
    tg_table_name
  )
  into next_row_index;

  new.row_index = next_row_index;
  return new;
end;
$$;

create or replace function public.ensure_ssot_identity(table_name text)
returns void
language plpgsql
as $$
declare
  sequence_name text := format('%s_id_seq', table_name);
  sequence_regclass text := format('public.%I', sequence_name);
  index_name text := format('%s_id_key', table_name);
begin
  execute format('alter table public.%I add column if not exists id bigint', table_name);
  execute format('create sequence if not exists public.%I', sequence_name);
  execute format('alter sequence public.%I owned by public.%I.id', sequence_name, table_name);
  execute format(
    'alter table public.%I alter column id set default nextval(%L::regclass)',
    table_name,
    sequence_regclass
  );
  execute format(
    'update public.%I set id = nextval(%L::regclass) where id is null',
    table_name,
    sequence_regclass
  );
  execute format(
    'select setval(%L::regclass, coalesce((select max(id) from public.%I), 0) + 1, false)',
    sequence_regclass,
    table_name
  );
  execute format('alter table public.%I alter column id set not null', table_name);
  execute format('create unique index if not exists %I on public.%I (id)', index_name, table_name);
end;
$$;

create table if not exists public.ssot_hanname_master (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  char text not null,
  is_inmyong boolean,
  meanings jsonb,
  detail_url text,
  source text,
  fetched_at timestamptz,
  readings jsonb,
  reading_initials jsonb,
  radical_label text,
  radical_char text,
  strokes jsonb,
  element_pronunciation text,
  element_resource text,
  reading_e text,
  reading_c text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_surname_map (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  surname_reading text not null,
  hanja text,
  is_default boolean,
  popularity_rank integer,
  element_pronunciation text,
  element_resource text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_hanja_tags (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  char text not null,
  tags jsonb,
  tag_scores jsonb,
  evidence jsonb,
  risk_flags jsonb,
  created_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_blacklist_words (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  pattern text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_blacklist_initials (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  pattern text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_name_pool_m (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  generated_at timestamptz,
  input text,
  gender text,
  total_count integer,
  name text,
  tier text,
  score double precision,
  score_breakdown jsonb,
  features jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_name_pool_f (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  generated_at timestamptz,
  input text,
  gender text,
  total_count integer,
  name text,
  tier text,
  score double precision,
  score_breakdown jsonb,
  features jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_hanname_master_conflicts (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  char text not null,
  existing jsonb,
  incoming jsonb,
  detected_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_hanname_metrics (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  char text not null,
  page integer,
  source_url text,
  checked_at timestamptz,
  usage_count jsonb,
  reading_level text,
  writing_level text,
  warnings jsonb,
  updated_at timestamptz not null default now()
);

alter table if exists public.ssot_surname_map
  add column if not exists element_pronunciation text;

alter table if exists public.ssot_surname_map
  add column if not exists element_resource text;

with surname_elements as (
  select distinct on (char)
    char,
    element_pronunciation,
    element_resource
  from public.ssot_hanname_master
  where element_pronunciation is not null or element_resource is not null
  order by
    char,
    (element_resource is not null) desc,
    (element_pronunciation is not null) desc,
    coalesce(is_inmyong, false) desc,
    row_index asc
)
update public.ssot_surname_map as sm
set
  element_pronunciation = coalesce(sm.element_pronunciation, se.element_pronunciation),
  element_resource = coalesce(sm.element_resource, se.element_resource)
from surname_elements as se
where sm.hanja = se.char
  and (sm.element_pronunciation is null or sm.element_resource is null);

select public.ensure_ssot_identity('ssot_hanname_master');
select public.ensure_ssot_identity('ssot_surname_map');
select public.ensure_ssot_identity('ssot_hanja_tags');
select public.ensure_ssot_identity('ssot_blacklist_words');
select public.ensure_ssot_identity('ssot_blacklist_initials');
select public.ensure_ssot_identity('ssot_name_pool_m');
select public.ensure_ssot_identity('ssot_name_pool_f');
select public.ensure_ssot_identity('ssot_hanname_master_conflicts');
select public.ensure_ssot_identity('ssot_hanname_metrics');

drop trigger if exists trg_assign_row_index_ssot_hanname_master on public.ssot_hanname_master;
create trigger trg_assign_row_index_ssot_hanname_master
before insert on public.ssot_hanname_master
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_surname_map on public.ssot_surname_map;
create trigger trg_assign_row_index_ssot_surname_map
before insert on public.ssot_surname_map
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_hanja_tags on public.ssot_hanja_tags;
create trigger trg_assign_row_index_ssot_hanja_tags
before insert on public.ssot_hanja_tags
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_blacklist_words on public.ssot_blacklist_words;
create trigger trg_assign_row_index_ssot_blacklist_words
before insert on public.ssot_blacklist_words
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_blacklist_initials on public.ssot_blacklist_initials;
create trigger trg_assign_row_index_ssot_blacklist_initials
before insert on public.ssot_blacklist_initials
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_name_pool_m on public.ssot_name_pool_m;
create trigger trg_assign_row_index_ssot_name_pool_m
before insert on public.ssot_name_pool_m
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_name_pool_f on public.ssot_name_pool_f;
create trigger trg_assign_row_index_ssot_name_pool_f
before insert on public.ssot_name_pool_f
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_hanname_master_conflicts on public.ssot_hanname_master_conflicts;
create trigger trg_assign_row_index_ssot_hanname_master_conflicts
before insert on public.ssot_hanname_master_conflicts
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_hanname_metrics on public.ssot_hanname_metrics;
create trigger trg_assign_row_index_ssot_hanname_metrics
before insert on public.ssot_hanname_metrics
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_touch_ssot_hanname_master on public.ssot_hanname_master;
create trigger trg_touch_ssot_hanname_master
before update on public.ssot_hanname_master
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_surname_map on public.ssot_surname_map;
create trigger trg_touch_ssot_surname_map
before update on public.ssot_surname_map
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_hanja_tags on public.ssot_hanja_tags;
create trigger trg_touch_ssot_hanja_tags
before update on public.ssot_hanja_tags
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_blacklist_words on public.ssot_blacklist_words;
create trigger trg_touch_ssot_blacklist_words
before update on public.ssot_blacklist_words
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_blacklist_initials on public.ssot_blacklist_initials;
create trigger trg_touch_ssot_blacklist_initials
before update on public.ssot_blacklist_initials
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_name_pool_m on public.ssot_name_pool_m;
create trigger trg_touch_ssot_name_pool_m
before update on public.ssot_name_pool_m
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_name_pool_f on public.ssot_name_pool_f;
create trigger trg_touch_ssot_name_pool_f
before update on public.ssot_name_pool_f
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_hanname_master_conflicts on public.ssot_hanname_master_conflicts;
create trigger trg_touch_ssot_hanname_master_conflicts
before update on public.ssot_hanname_master_conflicts
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_hanname_metrics on public.ssot_hanname_metrics;
create trigger trg_touch_ssot_hanname_metrics
before update on public.ssot_hanname_metrics
for each row
execute function public.touch_ssot_updated_at();
