-- LOGBELTS WEB: crea TODA la base de una vez (migraciones 0001 a 0011).
-- Pegar completo en Supabase > SQL Editor > New query > Run. Se puede correr más de una vez sin romper nada.

-- ===== 0001_cataloplus_mvp.sql =====
-- Cataloplus MVP: vendedores gestionables + mejoras con propuesta de IA
-- Correr una sola vez en el SQL Editor de Supabase.

create table if not exists vendedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

insert into vendedores (nombre)
values ('Flor Lastra'), ('Gaston'), ('Flor Faubel'), ('Alan Kieper')
on conflict (nombre) do nothing;

create table if not exists mejoras (
  id uuid primary key default gen_random_uuid(),
  vendedor text not null,
  producto_codigo text,
  pagina_catalogo text,
  referencia text,
  foto_url text,
  instruccion text not null,
  ia_resumen text,
  ia_tipo_cambio text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'rechazada')),
  created_at timestamptz not null default now(),
  revisado_en timestamptz
);

-- RLS deshabilitado a proposito: el resto del proyecto ya lee/escribe con la
-- anon key sin politicas (ver tablas "solicitudes" y "catalogo_material"),
-- se mantiene el mismo patron.
alter table vendedores disable row level security;
alter table mejoras disable row level security;

-- ===== 0002_grants.sql =====
-- Las tablas nuevas no heredaron los grants por default del schema public
-- (permission denied al leer con la anon key). Se igualan a los que ya
-- tienen "solicitudes" y "catalogo_material" para anon/authenticated.
grant select, insert, update on vendedores to anon, authenticated;
grant select, insert, update on mejoras to anon, authenticated;

-- ===== 0003_aplicar_mejora.sql =====
-- Permite aplicar una mejora aprobada al PDF real del catálogo.
alter table mejoras add column if not exists ia_texto_nuevo text;
alter table mejoras add column if not exists region jsonb;
alter table mejoras add column if not exists catalogo_version_url text;
alter table mejoras add column if not exists aplicado_en timestamptz;

-- Las columnas nuevas ya heredan los grants existentes sobre la tabla
-- (grant es a nivel tabla, no columna), pero se deja constancia por si
-- algún día se migra a grants por columna.

-- ===== 0004_catalogo.sql =====
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

-- Búsqueda difusa (trigram) sobre las columnas de texto simples.
create extension if not exists pg_trgm;
create index if not exists cat_productos_codigo_trgm on cat_productos using gin (codigo gin_trgm_ops);
create index if not exists cat_productos_nombre_trgm on cat_productos using gin (nombre gin_trgm_ops);

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

-- ===== 0005_despieces.sql =====
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

-- ===== 0006_eventos.sql =====
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

-- ===== 0007_media.sql =====
-- ============================================================
-- Fotos / videos de producto subidos desde el admin.
-- Agrega la columna 'video' y el bucket público 'media' con
-- políticas abiertas (mismo criterio "demo" que el resto del proyecto).
-- Correr en el SQL Editor de Supabase DESPUÉS de 0006.
-- ============================================================

alter table cat_productos add column if not exists video text;

-- bucket público
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- políticas del bucket 'media' (subir / editar / borrar / leer sin login)
drop policy if exists "media leer"       on storage.objects;
drop policy if exists "media subir"      on storage.objects;
drop policy if exists "media actualizar" on storage.objects;
drop policy if exists "media borrar"     on storage.objects;

create policy "media leer"       on storage.objects for select using (bucket_id = 'media');
create policy "media subir"      on storage.objects for insert with check (bucket_id = 'media');
create policy "media actualizar" on storage.objects for update using (bucket_id = 'media') with check (bucket_id = 'media');
create policy "media borrar"     on storage.objects for delete using (bucket_id = 'media');

-- ===== 0008_visitas.sql =====
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

-- ===== 0009_galeria_videos.sql =====
-- ============================================================
-- Galería de fotos y videos por producto (más de una foto / video).
-- `foto` sigue siendo la portada (la que ya trae el catálogo).
-- `galeria` = fotos adicionales. `videos` = todos los videos
-- (reemplaza a la columna `video` singular, que no se usaba).
-- ============================================================

alter table cat_productos add column if not exists galeria text[] not null default '{}';
alter table cat_productos add column if not exists videos  text[] not null default '{}';

alter table cat_productos disable row level security;

-- ===== 0010_visitantes.sql =====
-- ============================================================
-- "Login clientes": pantalla de acceso única vez (empresa/nombre +
-- teléfono, ambos obligatorios) antes de ver el catálogo público, más
-- el interruptor para prenderla/apagarla desde el admin y la identidad
-- de visitante en cada evento ya registrado (búsquedas, vistas, etc.)
-- para poder ver "qué usuario hizo qué búsqueda".
-- Correr en el SQL Editor de Supabase DESPUÉS de 0009.
-- ============================================================

-- Interruptor global (fila única, id siempre 1).
create table if not exists cat_config (
  id            int primary key default 1,
  gate_clientes boolean not null default false,
  actualizado   timestamptz not null default now(),
  constraint cat_config_fila_unica check (id = 1)
);
insert into cat_config (id, gate_clientes) values (1, false)
  on conflict (id) do nothing;

alter table cat_config disable row level security;
grant select, insert, update on cat_config to anon, authenticated;

-- Quién completó el acceso (empresa/nombre + teléfono).
create table if not exists cat_visitantes (
  id             uuid primary key default gen_random_uuid(),
  empresa_nombre text not null,
  telefono       text not null,
  creado         timestamptz not null default now()
);
create index if not exists cat_visitantes_creado_idx on cat_visitantes (creado desc);

alter table cat_visitantes disable row level security;
grant select, insert on cat_visitantes to anon, authenticated;

-- Vincula cada evento/visita ya existente con el visitante que lo generó.
alter table cat_eventos add column if not exists visitante_id uuid;
alter table cat_visitas add column if not exists visitante_id uuid;
create index if not exists cat_eventos_visitante_idx on cat_eventos (visitante_id, creado desc);
create index if not exists cat_visitas_visitante_idx on cat_visitas (visitante_id);

-- ===== 0011_web_contactos.sql =====
-- ============================================================
-- Web institucional + catálogo: contactos comerciales (con seguimiento y
-- vendedor asignado), pedidos enviados desde la web y distribuidores
-- públicos para el mapa "Dónde comprar".
-- Correr en el SQL Editor de Supabase DESPUÉS de 0010.
--
-- IMPORTANTE (datos personales): cat_contactos y cat_pedidos NO se pueden
-- leer con la clave pública (anon), que viaja en el navegador. El servidor
-- los lee y edita con SUPABASE_SERVICE_ROLE_KEY (variable de entorno en
-- Vercel). Sin esa variable los contactos se guardan igual, pero el panel
-- /admin/contactos no los puede mostrar.
-- ============================================================

-- Vendedores: datos para asignar y avisar contactos por zona.
alter table vendedores add column if not exists telefono         text;
alter table vendedores add column if not exists email            text;
alter table vendedores add column if not exists provincias       text[] not null default '{}';
alter table vendedores add column if not exists recibe_contactos boolean not null default true;

-- Contactos que llegan desde la web (popup, formulario, búsqueda sin resultado, pedido rápido, asistente).
create table if not exists cat_contactos (
  id           uuid primary key default gen_random_uuid(),
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now(),
  origen       text not null default 'contacto',
  empresa      text,
  nombre       text,
  telefono     text,
  email        text,
  localidad    text,
  provincia    text,
  consulta     text,
  estado       text not null default 'nuevo'
               check (estado in ('nuevo', 'contactado', 'cliente', 'descartado')),
  vendedor_id  uuid references vendedores(id) on delete set null,
  notas        text,
  visitante_id uuid,
  meta         jsonb
);
create index if not exists cat_contactos_creado_idx   on cat_contactos (creado desc);
create index if not exists cat_contactos_estado_idx   on cat_contactos (estado, creado desc);
create index if not exists cat_contactos_vendedor_idx on cat_contactos (vendedor_id, creado desc);

alter table cat_contactos disable row level security;
revoke all on cat_contactos from anon, authenticated;
grant insert on cat_contactos to anon, authenticated;   -- guardar sí, leer no
grant all on cat_contactos to service_role;

-- Pedidos enviados desde la web (lista de pedido / pedido rápido). Sin precios: los maneja el vendedor.
create table if not exists cat_pedidos (
  id           uuid primary key default gen_random_uuid(),
  creado       timestamptz not null default now(),
  origen       text not null default 'lista',
  visitante_id uuid,
  items        jsonb not null,          -- [{codigo, nombre, cant}]
  n            int not null default 0
);
create index if not exists cat_pedidos_creado_idx    on cat_pedidos (creado desc);
create index if not exists cat_pedidos_visitante_idx on cat_pedidos (visitante_id, creado desc);

alter table cat_pedidos disable row level security;
revoke all on cat_pedidos from anon, authenticated;
grant insert on cat_pedidos to anon, authenticated;
grant all on cat_pedidos to service_role;

-- Distribuidores que aceptan aparecer en el mapa público "Dónde comprar".
create table if not exists cat_distribuidores (
  id         uuid primary key default gen_random_uuid(),
  creado     timestamptz not null default now(),
  nombre     text not null,
  direccion  text,
  localidad  text,
  provincia  text,
  telefono   text,
  whatsapp   text,
  lat        double precision,
  lng        double precision,
  publico    boolean not null default true,
  orden      int not null default 0
);
create index if not exists cat_distribuidores_prov_idx on cat_distribuidores (provincia, orden, nombre);

alter table cat_distribuidores disable row level security;
revoke all on cat_distribuidores from anon, authenticated;
grant select on cat_distribuidores to anon, authenticated;  -- es información pública
grant all on cat_distribuidores to service_role;
