-- ============================================================
-- Manuales y despieces + columnas que faltaban en cat_productos.
-- Correr en el SQL Editor de Supabase DESPUÉS de 0004_catalogo.sql.
-- ============================================================

alter table cat_productos add column if not exists clave_valida boolean;
alter table cat_productos add column if not exists fuente_nombre text;
alter table cat_productos add column if not exists descontinuado boolean not null default false;

create table if not exists cat_despieces (
  id       text primary key,
  marca    text not null,
  modelo   text not null,
  tipo     text not null default 'despiece',   -- despiece | manual | servicio
  titulo   text not null,
  url      text,
  archivo  text,                                -- nombre de PDF en /public/despieces
  fuente   text,
  publico  boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists cat_despieces_marca_modelo_idx on cat_despieces (marca, modelo);

alter table cat_despieces disable row level security;
grant select, insert, update, delete on cat_despieces to anon, authenticated;
