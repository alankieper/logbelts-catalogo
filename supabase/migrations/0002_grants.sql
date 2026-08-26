-- Las tablas nuevas no heredaron los grants por default del schema public
-- (permission denied al leer con la anon key). Se igualan a los que ya
-- tienen "solicitudes" y "catalogo_material" para anon/authenticated.
grant select, insert, update on vendedores to anon, authenticated;
grant select, insert, update on mejoras to anon, authenticated;
