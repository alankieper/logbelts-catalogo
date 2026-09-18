-- Ajustes generales del sitio editables desde el admin (temporada activa, fecha de
-- reinicio de estadísticas y futuras prioridades de exposición), en un solo JSON.
-- Se puede correr más de una vez.
alter table cat_config add column if not exists ajustes jsonb not null default '{}'::jsonb;

-- Reiniciar estadísticas borra filas de eventos y visitas (lo hace el servidor con la clave de servicio).
grant delete on cat_eventos to service_role;
grant delete on cat_visitas to service_role;
