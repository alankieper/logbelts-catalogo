-- ============================================================
-- Registro de eventos del catálogo (búsquedas, consultas, pedidos)
-- para el panel de métricas del admin.
-- Correr en el SQL Editor de Supabase DESPUÉS de 0005.
-- ============================================================

create table if not exists cat_eventos (
  id      bigserial primary key,
  tipo    text not null,          -- busqueda | consulta | lista_add | lista_envio | ver
  q       text,                   -- término buscado (tipo = busqueda)
  codigo  text,                   -- código de producto (consulta / lista_add / ver)
  n       integer,                -- nº de resultados (busqueda) o nº de ítems (lista_envio)
  meta    jsonb,                  -- extra: { codigos: [...], familia, marca }
  creado  timestamptz not null default now()
);

create index if not exists cat_eventos_creado_idx      on cat_eventos (creado desc);
create index if not exists cat_eventos_tipo_creado_idx  on cat_eventos (tipo, creado desc);

alter table cat_eventos disable row level security;
grant select, insert on cat_eventos to anon, authenticated;
grant usage, select on sequence cat_eventos_id_seq to anon, authenticated;
