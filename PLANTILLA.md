# Cómo armar el sitio de un cliente nuevo

Esta carpeta es una **plantilla**: el mismo sistema (web + catálogo mayorista) sirve para
cualquier negocio que venda productos con código y quiera que el cliente consulte por WhatsApp.
Hoy corre para Logbelts (repuestos de bosque y jardín), pero se adapta a repuestos de auto,
celulares, ferretería, lo que sea.

Está escrito para que lo pueda seguir alguien que no programa. Cada paso dice qué tocar y cómo
darse cuenta de que salió bien. Si algo no coincide con lo que ves en pantalla, pará y preguntá:
no hay nada que se rompa por preguntar, sí por adivinar.

---

## Antes de empezar: qué necesitás tener a mano

- La computadora con **Node.js** instalado (si ya podés correr `npm run dev`, está).
- Una cuenta de **GitHub** (donde vive el código) y una de **Vercel** (donde se publica el sitio).
- Del cliente: **nombre**, rubro, **logo** (dos versiones: una para fondo oscuro y otra para fondo
  claro), **dirección, teléfono, mail, horario y número de WhatsApp**.
- El **catálogo de productos**: idealmente en Excel, con código, nombre y categoría de cada uno.
- Las **fotos** de los productos, si las hay.

---

## Paso 1 — Copiar el repositorio

En la terminal, parado en la carpeta donde guardás tus proyectos:

```bash
git clone <la-direccion-del-repositorio> cliente-nuevo
cd cliente-nuevo
npm install
```

Eso te deja una copia completa, con los datos de Logbelts adentro. En el paso 2 la vaciás.

> Si preferís no clonar, alcanza con copiar la carpeta entera y borrar la subcarpeta oculta `.git`
> para empezar un historial nuevo.

---

## Paso 2 — Vaciar el catálogo (la copia en blanco)

Hay un script que borra todos los datos y fotos de Logbelts y deja el proyecto limpio.

Primero mirá qué haría, sin tocar nada:

```bash
node data/scripts/nuevo-cliente.mjs --dry-run
```

Te va a listar los archivos que vaciaría y cuántas fotos borraría. Si te convence, hacelo de verdad:

```bash
node data/scripts/nuevo-cliente.mjs --si
```

**Esto no se puede deshacer**, por eso pide el `--si` explícito. Si te equivocaste de carpeta y
borraste los datos de un cliente que estaba andando, recuperalos con `git checkout data public`.

Qué deja el script:

| Qué | Cómo queda |
|---|---|
| `data/productos.json` y el resto de los archivos de datos | vacíos (pero con la forma correcta, para que nada explote) |
| `public/fotos`, `public/marcas`, `public/img`, `public/og`, `public/despieces` | carpetas vacías |
| `lib/marca.js` | con datos de ejemplo ("Mi Empresa"), listo para que lo edites |

No toca nada de `app/` ni el resto de `lib/`: el sistema queda igual de funcional, sólo que sin
contenido.

---

## Paso 3 — Cargar la identidad del cliente (`lib/marca.js`)

Abrí `lib/marca.js` con cualquier editor de texto. Es **el único archivo de configuración**: todo
lo que escribas ahí aparece solo en el catálogo, los mensajes de WhatsApp, los títulos de Google y
el panel de administración.

```js
export const MARCA = {
  nombre: 'Mi Empresa',
  rubro: 'Repuestos',
  descripcionCorta: 'Venta mayorista de repuestos.',
  lema: 'Repuestos que marcan la diferencia',
  logoClaro: '/logo-blanco.png',   // el que va sobre fondo oscuro
  logoOscuro: '/logo-azul.png',    // el que va sobre fondo claro

  codigo: {
    etiqueta: 'Código',            // p. ej. 'Código Mi Empresa'
    ejemplos: '1234567',           // ejemplos que se muestran en el buscador
  },

  contacto: {
    direccion: '', telefono: '', email: '',
    dias: '', horario: '',
    whatsapp: '',                  // link completo: https://wa.me/549...
  },
  portalB2B: '',                   // dejalo vacío si el cliente no tiene portal

  maquinas: {                      // cómo se llama aquello a lo que le va el repuesto
    singular: 'máquina',
    plural: 'máquinas',
    etiquetaBusqueda: 'Buscá por máquina',
  },

  modulos: { /* ver el paso 4 */ },
};
```

**Cuidado con estas dos:**

- `codigo.etiqueta` es el nombre del código propio del negocio. Aparece en la ficha del producto,
  en el buscador y en los pedidos. Si el cliente le dice "Código interno", poné eso.
- `maquinas.singular` / `maquinas.plural` cambian todos los textos del buscador por compatibilidad.
  Para una casa de repuestos de auto poné `'auto'` / `'autos'`; para celulares, `'equipo'` /
  `'equipos'` (o `'modelo'` / `'modelos'`).

Guardá el archivo y mirá el sitio (paso 8): los textos ya cambiaron.

---

## Paso 4 — Elegir qué módulos quedan prendidos

Abajo de todo en `lib/marca.js` está la lista de módulos. Cada uno se prende con `true` y se apaga
con `false`. **Cuando apagás uno, su página deja de existir (da "no encontrado") y sus accesos
desaparecen del catálogo.** No hay que borrar código.

| Módulo | Qué hace | ¿Para quién sirve? |
|---|---|---|
| `maquinas` | Buscador "¿para qué máquina es el repuesto?" (marca → modelo → repuestos compatibles) y los chips "Sirve para" en cada ficha. | Cualquier rubro con compatibilidad por modelo. |
| `despiece` | Links a los diagramas de partes del fabricante y los PDF propios cargados en el admin. | **Propio de bosque y jardín.** Casi siempre se apaga. |
| `guias` | Guías técnicas de la web (correas, espadas y cadenas, tanza). | **Propio de bosque y jardín.** Se apaga o se reemplaza. |
| `dibujos` | Las ilustraciones de línea de las piezas (encabezados, tarjetas de categoría y productos sin foto). | Los dibujos actuales son de motosierras. Si no los reemplazás, apagalo: el catálogo vuelve a los íconos simples de antes, sin huecos. |
| `piezas3d` | El visor 3D del carburador en la portada. | **Propio de bosque y jardín.** |
| `distribuidores` | Portal B2B y mapa de "dónde comprar". | Si el cliente tiene distribuidores. |
| `material` | Material para el comercio (placas, logos para imprimir). | Opcional. |
| `tutoriales`, `lanzamientos` | Secciones de contenido de la web. | Opcional. |
| `pedidoRapido` | Pegar una lista de códigos o subir un Excel y armar el pedido de una. | Muy útil si el cliente le vende a comercios que reponen stock. |

### Ejemplo: repuestos de auto

```js
maquinas: { singular: 'auto', plural: 'autos', etiquetaBusqueda: 'Buscá por auto' },
modulos: {
  maquinas: true,        // marca y modelo del auto: es el corazón del catálogo
  despiece: false,       // los despieces de bosque y jardín no aplican
  guias: false,
  dibujos: false,        // los dibujos son de motosierras
  piezas3d: false,
  distribuidores: true,
  material: true,
  tutoriales: true,
  lanzamientos: true,
  pedidoRapido: true,    // el taller pide 20 códigos de una
},
```

### Ejemplo: repuestos de celular

```js
maquinas: { singular: 'equipo', plural: 'equipos', etiquetaBusqueda: 'Buscá por equipo' },
modulos: {
  maquinas: true,        // Samsung A15, iPhone 13… misma lógica que marca y modelo
  despiece: false,
  guias: false,
  dibujos: false,
  piezas3d: false,
  distribuidores: false, // suele venderse directo
  material: false,
  tutoriales: true,
  lanzamientos: true,
  pedidoRapido: true,
},
```

---

## Paso 5 — Reemplazar logos y fotos

Todo lo visual vive en la carpeta `public/`. Los archivos se reemplazan con el mismo nombre y listo:

| Dónde | Qué va |
|---|---|
| `public/logo-blanco.png` | El logo para fondo oscuro (encabezado, admin, pantalla de acceso). |
| `public/logo-azul.png` | El logo para fondo claro. |
| `public/fotos/` | Una foto por producto. El nombre del archivo se indica en la columna de foto del Excel. |
| `public/marcas/` | Logos de las marcas que aparecen en la cinta de la portada, uno por marca: `stihl.svg`, `bosch.png`… El nombre del archivo tiene que ser el nombre de la marca en minúscula y sin espacios. |
| `public/img/` | Fotos de la web (portada, secciones). |
| `public/og/` | Las imágenes que se ven cuando compartís un link por WhatsApp. Se generan con `node data/scripts/og-familias.mjs`. |

Si cambiás el nombre de los archivos de logo, acordate de actualizar `logoClaro` y `logoOscuro` en
`lib/marca.js`.

---

## Paso 6 — Cargar el catálogo con el Excel del admin

La forma más cómoda de cargar productos es la planilla del panel de administración.

1. Levantá el sitio (paso 8) y entrá a **http://localhost:3000/admin** → pestaña **Excel**.
2. **Descargá** la planilla. Como el catálogo está vacío, viene sólo con los encabezados: te sirve
   como modelo con las columnas exactas que el sistema entiende.
3. Completala en Excel o Google Sheets. Lo mínimo por fila: **código**, **nombre**, **familia** y
   **subcategoría**. Después, si los tenés: descripción, marcas compatibles, códigos originales
   (OEM), medidas y el nombre del archivo de la foto.
4. **Subí** la planilla en esa misma pantalla. El sistema te muestra qué va a cambiar antes de
   confirmar: revisalo y aceptá.
5. Repetí las veces que haga falta. Se puede volver a subir la planilla corregida cuantas veces
   quieras; no duplica productos, actualiza los que ya están por código.

**No pongas precios ni stock en la planilla**: el sistema no los maneja a propósito (mirá el final
de este documento).

---

## Paso 7 — Publicar: Vercel y Supabase

El sitio puede funcionar de dos maneras:

- **Sin base de datos**: los productos salen de `data/productos.json`, que viaja con el código. Es
  lo más simple y alcanza para un catálogo que se actualiza de vez en cuando. Cada cambio se
  publica volviendo a subir el código.
- **Con base de datos (Supabase)**: los productos viven en la nube. El cliente puede editar desde
  el admin y los cambios se ven al instante, sin publicar de nuevo. Es lo recomendado si el cliente
  va a tocar el catálogo seguido.

### 7.1 Crear el proyecto en Vercel

1. Subí tu copia a un repositorio nuevo de GitHub.
2. Entrá a vercel.com → **Add New → Project** → elegí ese repositorio.
3. Vercel detecta Next.js solo. Dale **Deploy**.
4. Cuando termina te da una dirección tipo `https://cliente-nuevo.vercel.app`.

### 7.2 Crear la base en Supabase (si vas a usarla)

1. Entrá a supabase.com → **New project**. Anotá la contraseña que te pide.
2. Andá a **SQL Editor** y corré, **en este orden**, el contenido de cada archivo de
   `supabase/migrations/`:

   | Archivo | Para qué |
   |---|---|
   | `0001_cataloplus_mvp.sql` | Vendedores y propuestas de mejora. |
   | `0002_grants.sql` | Permisos de esas tablas. |
   | `0003_aplicar_mejora.sql` | Columnas extra de las mejoras. |
   | `0004_catalogo.sql` | **Las tablas del catálogo** (productos y categorías). |
   | `0005_despieces.sql` | Despieces y manuales. |
   | `0006_eventos.sql` | Registro de búsquedas y consultas (panel de métricas). |
   | `0007_media.sql` | Fotos y videos subidos desde el admin. |
   | `0008_visitas.sql` | Visitas del sitio. |
   | `0009_galeria_videos.sql` | Galería de cada producto. |
   | `0010_visitantes.sql` | Visitantes identificados. |
   | `0011_web_contactos.sql` | Contactos que deja la web. |

   Se copian y pegan enteros, uno por vez, y se aprieta **Run**. Si alguno tira un error de "ya
   existe", seguí con el siguiente: están escritos para poder correrse de nuevo sin romper nada.

3. En Supabase → **Project Settings → API** anotá la **URL**, la **anon key** y la
   **service_role key**.

### 7.3 Variables de entorno

En Vercel → tu proyecto → **Settings → Environment Variables**. Se cargan una por una, para los
tres entornos (Production, Preview y Development):

| Variable | Qué es | ¿Obligatoria? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | La dirección final del sitio (`https://cliente-nuevo.vercel.app`). Se usa en los links que se comparten y en Google. | Sí |
| `SITIO_PUBLICO` | `1` cuando querés que Google indexe el sitio. Mientras lo armás, dejala en `0` o sin poner. | Recomendada |
| `NEXT_PUBLIC_SUPABASE_URL` | La URL del proyecto de Supabase. | Sólo con base de datos |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La anon key de Supabase. | Sólo con base de datos |
| `SUPABASE_SERVICE_ROLE_KEY` | La service_role key. **Es una clave secreta: no va nunca en el código ni se comparte.** | Sólo con base de datos |
| `CATALOGO_USA_DB` | `1` para que el catálogo lea de Supabase en vez del archivo. | Sólo con base de datos |
| `ANTHROPIC_API_KEY` | Habilita el asistente de repuestos y las propuestas de mejora con IA. | No |
| `RESEND_API_KEY`, `AVISOS_EMAIL`, `AVISOS_FROM` | Avisos por mail cuando alguien deja una consulta. | No |
| `VISITA_SALT` | Texto cualquiera, largo y propio del cliente, para anonimizar las visitas. | Recomendada |

Para trabajar en tu computadora, las mismas variables van en un archivo `.env.local` en la raíz del
proyecto (una por línea, `NOMBRE=valor`). Ese archivo **no se sube** al repositorio.

4. Si usás base de datos, cargá los productos con `npm run seed` (lee `data/productos.json` y lo
   sube a Supabase). Después de eso, los cambios se hacen desde el admin.

---

## Paso 8 — Probar antes de entregar

```bash
npm run dev
```

y abrí **http://localhost:3000**. Repasá esta lista:

- [ ] La portada muestra el logo, el nombre y el contacto del cliente.
- [ ] El catálogo muestra las categorías y los productos cargados.
- [ ] Entrá a un producto: el código dice la etiqueta que pusiste (`codigo.etiqueta`), la foto se
      ve y el botón de WhatsApp abre el número correcto.
- [ ] Buscá un código y un nombre: aparecen resultados.
- [ ] Los módulos que apagaste **no** aparecen en el menú y su dirección da "no encontrado".
- [ ] Entrá a `/admin` y confirmá que se ve el logo nuevo.
- [ ] Mirá el sitio en el celular (o angostando la ventana): tiene que verse bien igual.

---

## Qué es propio de bosque y jardín y hay que reemplazar

Estas cuatro cosas están hechas para Logbelts. Si no las reemplazás, **apagá el módulo**: el sitio
queda coherente igual.

1. **Despiece** (`modulos.despiece`). Enlaza a diyspareparts.com, un sitio de diagramas de partes de
   motosierras y desmalezadoras. Para otro rubro no sirve: apagalo, o reemplazalo cargando los PDF
   propios del cliente desde **Admin → Manuales**.
2. **Guías técnicas** (`modulos.guias`). Son notas sobre correas, espadas, cadenas y tanza. El
   contenido está en `lib/sitio.js`: o lo apagás, o lo reescribís con las guías del rubro nuevo.
3. **Dibujos de línea** (`modulos.dibujos`). Son ilustraciones de carburadores, cadenas, filtros.
   Aparecen en los encabezados, en las tarjetas de categoría y en los productos sin foto. Apagado,
   el catálogo vuelve a los íconos chiquitos de antes y no queda ningún hueco.
4. **Piezas 3D** (`modulos.piezas3d`). El carburador que gira en la portada. Es un modelo hecho a
   mano para Logbelts: apagalo salvo que encargues uno nuevo.

Además, revisá a mano estas dos cosas, que hoy tienen ejemplos de bosque y jardín:

- Las **sugerencias del asistente** de repuestos (`app/components/Asistente.js`): dicen cosas como
  "Carburador para Stihl MS 250". Cambialas por ejemplos del rubro del cliente.
- Los **textos de la web** (`lib/sitio.js`): historia, secciones y categorías de la portada.

---

## Qué NO hace la plantilla

Vale la pena decirlo antes de prometerle cosas al cliente:

- **No maneja precios.** En ningún lado se muestra ni se guarda un precio. El precio lo pasa el
  vendedor por WhatsApp, caso por caso.
- **No maneja stock ni disponibilidad.** El catálogo muestra lo que el negocio vende, no lo que hay
  hoy en el depósito. La disponibilidad la confirma el vendedor.
- **No es una tienda online.** No hay carrito con pago, ni facturación, ni envíos. El "pedido" es
  una lista que el cliente arma y le manda a su vendedor por WhatsApp.
- **No sincroniza con el sistema de gestión** del cliente. La carga es por Excel o desde el admin.

Todo eso es a propósito: la venta es mayorista y la cierra una persona. El sitio está para que el
comprador encuentre el repuesto y llegue al vendedor con el código en la mano.
