-- ============================================================
-- Campo "Despiece" en cada producto: lista de máquinas a las que corresponde
-- ("Stihl FS 55", "Husqvarna 143R"). Con ese nombre se vinculan solos máquina y repuestos,
-- y cada máquina muestra su despiece publicado en internet (data/despiece-online.json).
-- Se puede correr más de una vez.
-- ============================================================

alter table cat_productos add column if not exists despiece text[] not null default '{}';
create index if not exists cat_productos_despiece_idx on cat_productos using gin (despiece);
