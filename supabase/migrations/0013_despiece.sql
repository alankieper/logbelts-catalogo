-- ============================================================
-- Despieces por máquina.
--  1) Campo "Despiece" en cada producto: lista de máquinas a las que corresponde
--     ("Stihl FS 55", "Husqvarna 143R"). Con ese nombre se vinculan solos máquina y repuestos.
--  2) Tabla de diagramas: cada máquina puede tener varios (una variante por diagrama:
--     FS 55, FS 55 R, FS 55 T), con su imagen y los números de pieza del dibujo.
-- Se puede correr más de una vez.
-- ============================================================

alter table cat_productos add column if not exists despiece text[] not null default '{}';
create index if not exists cat_productos_despiece_idx on cat_productos using gin (despiece);

create table if not exists cat_despiece_diagramas (
  id          text primary key,
  marca       text not null,              -- "Stihl"
  modelo      text not null,              -- "FS 55" (la máquina; agrupa las variantes)
  clave       text not null,              -- "stihl|fs55" (nombre normalizado para vincular)
  variante    text not null,              -- "FS 55 R"
  imagen      text,                       -- URL de la imagen del diagrama
  piezas      jsonb not null default '[]'::jsonb,  -- [{ "ref": "14", "codigo": "2102844" } | { "ref": "3", "nombre": "Tornillo" }]
  orden       integer not null default 0,
  publico     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists cat_despiece_diagramas_clave_idx on cat_despiece_diagramas (clave);

-- Lectura pública; escribe sólo el servidor (clave de servicio, desde el admin)
alter table cat_despiece_diagramas enable row level security;
drop policy if exists "diagramas leer" on cat_despiece_diagramas;
create policy "diagramas leer" on cat_despiece_diagramas for select using (publico);
revoke all on cat_despiece_diagramas from anon, authenticated;
grant select on cat_despiece_diagramas to anon, authenticated;
grant all on cat_despiece_diagramas to service_role;
