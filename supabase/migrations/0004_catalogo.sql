-- ============================================================
-- Catálogo Logbelts — esquema de productos
-- Correr una vez en el SQL Editor de Supabase.
-- Mantiene el patrón del proyecto: RLS off + grants a anon
-- (inseguro; se endurece antes de exponer /admin en producción).
-- ============================================================

create table if not exists cat_categorias (
  id          bigint generated always as identity primary key,
  familia     text not null,
  subcategoria text not null,
  slug        text generated always as (
                lower(regexp_replace(familia, '[^a-zA-Z0-9]+', '-', 'g')) || '__' ||
                lower(regexp_replace(subcategoria, '[^a-zA-Z0-9]+', '-', 'g'))
              ) stored,
  orden       int not null default 0,
  visible     boolean not null default true,
  unique (familia, subcategoria)
);

create table if not exists cat_productos (
  codigo          text primary key,                 -- código Logbelts (7 díg)
  nombre          text,
  descripcion     text,
  fuente_desc     text,                             -- 'texto del PDF' | 'derivada...' | 'editado' | 'manual'
  familia         text,
  familia_indice  text,
  subcategoria    text,
  compatibilidad  text,
  ubicacion       text,
  marcas          text[] not null default '{}',
  codigo_original text[] not null default '{}',
  medidas         text[] not null default '{}',
  ref_interna     text[] not null default '{}',
  clave_rubro     text,
  clave_subrubro  text,
  clave_producto  text,
  pagina          int,
  origen          text,                             -- 'tabla' | 'grilla' | 'anotacion' | 'manual'
  flags           text[] not null default '{}',
  encabezado_pdf  text,
  foto            text,                             -- nombre de archivo en el bucket / carpeta
  foto_confianza  text,
  estado          text,
  oculto          boolean not null default false,
  orden           int not null default 0,
  created_at      timestamptz not null default now(),
  editado_en      timestamptz
);

create index if not exists cat_productos_familia_idx on cat_productos (familia, subcategoria);
create index if not exists cat_productos_oculto_idx on cat_productos (oculto);

-- Búsqueda de texto + difusa
create extension if not exists pg_trgm;
create index if not exists cat_productos_trgm_idx on cat_productos
  using gin ((coalesce(codigo,'') || ' ' || coalesce(nombre,'') || ' ' || coalesce(descripcion,'') || ' ' ||
              array_to_string(codigo_original,' ') || ' ' || array_to_string(marcas,' ')) gin_trgm_ops);

-- Historial de cambios (para poder volver atrás)
create table if not exists cat_revisiones (
  id         bigint generated always as identity primary key,
  codigo     text not null,
  datos      jsonb not null,          -- snapshot del producto antes del cambio
  origen     text not null default 'manual',   -- 'manual' | 'import' | 'ia'
  autor      text,
  created_at timestamptz not null default now()
);
create index if not exists cat_revisiones_codigo_idx on cat_revisiones (codigo, created_at desc);

-- Corridas de importación de PDF (para la etapa siguiente)
create table if not exists cat_import_runs (
  id         bigint generated always as identity primary key,
  archivo    text,
  estado     text not null default 'procesando',   -- procesando | listo | aplicado | descartado
  stats      jsonb not null default '{}',
  autor      text,
  created_at timestamptz not null default now(),
  aplicado_en timestamptz
);

create table if not exists cat_import_cambios (
  id           bigint generated always as identity primary key,
  run_id       bigint not null references cat_import_runs(id) on delete cascade,
  tipo         text not null,          -- nuevo | modificado | eliminado | reclasificado
  codigo       text,
  actual       jsonb,
  propuesto    jsonb,
  confianza    text,
  pagina       int,
  estado       text not null default 'pendiente',   -- pendiente | aprobado | rechazado | editado
  revisado_por text,
  revisado_en  timestamptz
);
create index if not exists cat_import_cambios_run_idx on cat_import_cambios (run_id, estado);

-- Grants (igual patrón que 0002_grants.sql)
alter table cat_categorias      disable row level security;
alter table cat_productos       disable row level security;
alter table cat_revisiones      disable row level security;
alter table cat_import_runs     disable row level security;
alter table cat_import_cambios  disable row level security;

grant select, insert, update, delete on cat_categorias      to anon, authenticated;
grant select, insert, update, delete on cat_productos        to anon, authenticated;
grant select, insert, update, delete on cat_revisiones       to anon, authenticated;
grant select, insert, update, delete on cat_import_runs      to anon, authenticated;
grant select, insert, update, delete on cat_import_cambios   to anon, authenticated;
