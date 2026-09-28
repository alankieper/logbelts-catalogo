-- ============================================================
-- CIERRE DE PERMISOS (seguridad)
--
-- Hasta ahora, la clave pública del sitio (la que viaja en cualquier navegador) podía:
--   · leer nombre y teléfono de todos los clientes registrados y su historial de búsquedas,
--   · editar o BORRAR el catálogo completo,
--   · subir, pisar y borrar cualquier archivo del depósito de imágenes.
--
-- Esta migración deja lo mínimo indispensable:
--   · lectura pública SOLO de lo que ya es público (productos, categorías, distribuidores),
--   · el resto pasa por el servidor, que usa la clave de servicio (service_role).
--
-- El sitio sigue funcionando igual: el servidor lee y escribe con la clave de servicio.
-- Se puede correr más de una vez.
-- ============================================================

-- ---------- Catálogo: se lee público, se escribe sólo desde el servidor ----------
revoke all on cat_productos      from anon, authenticated;
revoke all on cat_categorias     from anon, authenticated;
revoke all on cat_revisiones     from anon, authenticated;
revoke all on cat_import_runs    from anon, authenticated;
revoke all on cat_import_cambios from anon, authenticated;
revoke all on cat_despieces      from anon, authenticated;

grant select on cat_productos  to anon, authenticated;   -- el catálogo es público
grant select on cat_categorias to anon, authenticated;
grant select on cat_despieces  to anon, authenticated;

grant all on cat_productos      to service_role;
grant all on cat_categorias     to service_role;
grant all on cat_revisiones     to service_role;
grant all on cat_import_runs    to service_role;
grant all on cat_import_cambios to service_role;
grant all on cat_despieces      to service_role;

-- ---------- Datos personales y de gestión: nada público ----------
revoke all on cat_visitantes from anon, authenticated;   -- nombre y teléfono de clientes
revoke all on cat_visitas    from anon, authenticated;   -- ciudad y visitas
revoke all on cat_eventos    from anon, authenticated;   -- qué buscó cada uno
revoke all on cat_config     from anon, authenticated;   -- interruptores del sitio
revoke all on vendedores     from anon, authenticated;   -- teléfonos y emails del equipo
revoke all on mejoras        from anon, authenticated;

grant all on cat_visitantes to service_role;
grant all on cat_visitas    to service_role;
grant all on cat_eventos    to service_role;
grant all on cat_config     to service_role;
grant all on vendedores     to service_role;
grant all on mejoras        to service_role;

revoke all on sequence cat_eventos_id_seq from anon, authenticated;
revoke all on sequence cat_visitas_id_seq from anon, authenticated;
grant usage, select on sequence cat_eventos_id_seq to service_role;
grant usage, select on sequence cat_visitas_id_seq to service_role;

-- Por si alguna tabla futura hereda permisos por defecto
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ---------- Depósito de imágenes: leer sí, escribir sólo el servidor ----------
-- Las subidas desde el panel siguen funcionando: el servidor entrega un permiso temporal
-- para cada archivo (signed upload URL), en vez de dejar el depósito abierto.
drop policy if exists "media leer"       on storage.objects;
drop policy if exists "media subir"      on storage.objects;
drop policy if exists "media actualizar" on storage.objects;
drop policy if exists "media borrar"     on storage.objects;

create policy "media leer" on storage.objects
  for select using (bucket_id = 'media');
create policy "media escribe el servidor" on storage.objects
  for all to service_role using (bucket_id = 'media') with check (bucket_id = 'media');
