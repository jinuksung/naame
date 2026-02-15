create or replace function public.touch_ssot_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.ssot_hanname_master (
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
  row_index integer primary key check (row_index >= 0),
  surname_reading text not null,
  hanja text,
  is_default boolean,
  popularity_rank integer,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_hanja_tags (
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
  row_index integer primary key check (row_index >= 0),
  pattern text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_blacklist_initials (
  row_index integer primary key check (row_index >= 0),
  pattern text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_name_pool_m (
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
  row_index integer primary key check (row_index >= 0),
  char text not null,
  existing jsonb,
  incoming jsonb,
  detected_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_hanname_metrics (
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
