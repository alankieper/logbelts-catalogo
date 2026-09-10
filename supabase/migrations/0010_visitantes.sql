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
