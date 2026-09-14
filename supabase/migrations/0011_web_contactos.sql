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
