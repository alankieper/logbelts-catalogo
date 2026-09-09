-- ============================================================
-- Galería de fotos y videos por producto (más de una foto / video).
-- `foto` sigue siendo la portada (la que ya trae el catálogo).
-- `galeria` = fotos adicionales. `videos` = todos los videos
-- (reemplaza a la columna `video` singular, que no se usaba).
-- ============================================================

alter table cat_productos add column if not exists galeria text[] not null default '{}';
alter table cat_productos add column if not exists videos  text[] not null default '{}';

alter table cat_productos disable row level security;
