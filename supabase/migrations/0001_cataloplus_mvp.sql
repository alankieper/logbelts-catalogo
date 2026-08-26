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
