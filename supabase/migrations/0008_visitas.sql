-- ============================================================
-- Visitas al catálogo: cuántas PERSONAS lo vieron (por IP hasheada,
-- no se guarda la IP real) y desde dónde (país / ciudad / referente).
-- Una fila por sesión de navegador. Correr después de 0007.
-- ============================================================

create table if not exists cat_visitas (
  id      bigserial primary key,
  ip_hash text,            -- sha256(ip + salt) recortado: cuenta personas sin guardar la IP
  pais    text,
  ciudad  text,
  region  text,
  path    text,
  ref     text,            -- dominio de origen (google, instagram, ...) o null = directo
  creado  timestamptz not null default now()
);

create index if not exists cat_visitas_creado_idx  on cat_visitas (creado desc);
create index if not exists cat_visitas_iphash_idx   on cat_visitas (ip_hash);

alter table cat_visitas disable row level security;
grant select, insert on cat_visitas to anon, authenticated;
grant usage, select on sequence cat_visitas_id_seq to anon, authenticated;
