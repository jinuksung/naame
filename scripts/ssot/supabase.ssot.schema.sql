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

create table if not exists public.ssot_name_block_syllable_rules (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  enabled boolean not null default true,
  s1_jung text,
  s1_jong text,
  s1_has_jong boolean,
  s2_jung text,
  s2_jong text,
  s2_has_jong boolean,
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.ssot_name_pool_syllable_position_rules (
  id bigserial unique,
  row_index integer primary key check (row_index >= 0),
  enabled boolean not null default true,
  syllable text not null check (char_length(syllable) = 1),
  gender text not null default 'ALL' check (gender in ('M', 'F', 'ALL')),
  blocked_position text not null check (blocked_position in ('START', 'END')),
  tier_scope text not null default 'ALL' check (tier_scope in ('ALL', 'NON_A')),
  note text,
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

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists enabled boolean not null default true;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists s1_jung text;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists s1_jong text;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists s1_has_jong boolean;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists s2_jung text;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists s2_jong text;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists s2_has_jong boolean;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists note text;

alter table if exists public.ssot_name_block_syllable_rules
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists enabled boolean not null default true;

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists syllable text;

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists gender text not null default 'ALL';

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists blocked_position text;

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists tier_scope text not null default 'ALL';

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists note text;

alter table if exists public.ssot_name_pool_syllable_position_rules
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'ssot_name_pool_syllable_position_rules'
  ) then
    update public.ssot_name_pool_syllable_position_rules
    set gender = coalesce(nullif(gender, ''), 'ALL'),
        tier_scope = coalesce(nullif(tier_scope, ''), 'ALL')
    where gender is null
       or gender = ''
       or tier_scope is null
       or tier_scope = '';
  end if;
end $$;

update public.ssot_surname_map as sm
set
  element_pronunciation = coalesce(
    sm.element_pronunciation,
    (
      select hm.element_pronunciation
      from generate_series(1, char_length(sm.hanja)) as seq(pos)
      join public.ssot_hanname_master as hm
        on hm.char = substring(sm.hanja from seq.pos for 1)
      where hm.element_pronunciation is not null
      order by
        seq.pos asc,
        coalesce(hm.is_inmyong, false) desc,
        hm.row_index asc
      limit 1
    )
  ),
  element_resource = coalesce(
    sm.element_resource,
    (
      select hm.element_resource
      from generate_series(1, char_length(sm.hanja)) as seq(pos)
      join public.ssot_hanname_master as hm
        on hm.char = substring(sm.hanja from seq.pos for 1)
      where hm.element_resource is not null
      order by
        seq.pos asc,
        coalesce(hm.is_inmyong, false) desc,
        hm.row_index asc
      limit 1
    )
  )
where sm.hanja is not null
  and char_length(sm.hanja) > 0
  and (sm.element_pronunciation is null or sm.element_resource is null);

select public.ensure_ssot_identity('ssot_hanname_master');
select public.ensure_ssot_identity('ssot_surname_map');
select public.ensure_ssot_identity('ssot_hanja_tags');
select public.ensure_ssot_identity('ssot_blacklist_words');
select public.ensure_ssot_identity('ssot_blacklist_initials');
select public.ensure_ssot_identity('ssot_name_block_syllable_rules');
select public.ensure_ssot_identity('ssot_name_pool_syllable_position_rules');
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

drop trigger if exists trg_assign_row_index_ssot_name_block_syllable_rules on public.ssot_name_block_syllable_rules;
create trigger trg_assign_row_index_ssot_name_block_syllable_rules
before insert on public.ssot_name_block_syllable_rules
for each row
execute function public.assign_ssot_row_index_if_missing();

drop trigger if exists trg_assign_row_index_ssot_name_pool_syllable_position_rules on public.ssot_name_pool_syllable_position_rules;
create trigger trg_assign_row_index_ssot_name_pool_syllable_position_rules
before insert on public.ssot_name_pool_syllable_position_rules
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

drop trigger if exists trg_touch_ssot_name_block_syllable_rules on public.ssot_name_block_syllable_rules;
create trigger trg_touch_ssot_name_block_syllable_rules
before update on public.ssot_name_block_syllable_rules
for each row
execute function public.touch_ssot_updated_at();

drop trigger if exists trg_touch_ssot_name_pool_syllable_position_rules on public.ssot_name_pool_syllable_position_rules;
create trigger trg_touch_ssot_name_pool_syllable_position_rules
before update on public.ssot_name_pool_syllable_position_rules
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
