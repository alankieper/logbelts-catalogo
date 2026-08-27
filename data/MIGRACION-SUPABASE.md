# Pasar el catálogo a Supabase (base de datos real)

Hoy el catálogo y el panel de administración funcionan leyendo/escribiendo
`data/productos.json`. Eso alcanza para probar local. Para producción (varios
usuarios, deploy) conviene mover los datos a la base de Supabase, que **ya está
enganchada al proyecto** (`gceymxcsmyxlzlpuzzzp`).

## Paso 1 — Crear las tablas

1. Entrá a Supabase → tu proyecto → **SQL Editor**.
2. Pegá el contenido de `supabase/migrations/0004_catalogo.sql` y dale **Run**.
   Crea: `cat_productos`, `cat_categorias`, `cat_revisiones`, `cat_import_runs`,
   `cat_import_cambios`, más los índices de búsqueda.

## Paso 2 — Cargar los 2.415 productos

En la terminal, dentro de la carpeta del proyecto:

```bash
npm run seed
```

Lee `data/productos.json` y sube todo a `cat_productos` (y las categorías).
Se puede volver a correr: usa *upsert* (no duplica).

## Paso 3 — Conectar la app a la base

Falta un cambio de código: hacer que `lib/catalogo.js` y `lib/catalogoStore.js`
lean/escriban en Supabase en vez del archivo. Es un reemplazo acotado — la
interfaz que usan las páginas no cambia. Se hace cuando definas que vas a deployar.

## Nota de seguridad

La migración deja las tablas con **RLS apagado y permisos abiertos** (mismo
patrón que el resto del proyecto). Antes de exponer `/admin` en internet hay que:
cuentas de usuario reales (Supabase Auth), RLS por rol, y sacar la escritura con
la `anon key`.
