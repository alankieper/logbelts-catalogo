-- Permite aplicar una mejora aprobada al PDF real del catálogo.
alter table mejoras add column if not exists ia_texto_nuevo text;
alter table mejoras add column if not exists region jsonb;
alter table mejoras add column if not exists catalogo_version_url text;
alter table mejoras add column if not exists aplicado_en timestamptz;

-- Las columnas nuevas ya heredan los grants existentes sobre la tabla
-- (grant es a nivel tabla, no columna), pero se deja constancia por si
-- algún día se migra a grants por columna.
