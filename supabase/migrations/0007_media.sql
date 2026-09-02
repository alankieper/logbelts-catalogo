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
