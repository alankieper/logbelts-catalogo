# Graph Report - logbelts-catalogo  (2026-09-11)

## Corpus Check
- Large corpus: 2160 files · ~1,270,993 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 964 nodes · 1586 edges · 73 communities (60 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.82)
- Token cost: 110,968 input · 0 output

## Community Hubs (Navigation)
- Catálogo público y búsqueda
- Panel admin e importación Excel
- Flujo de importación y revisión
- Mejoras: marcar región de foto
- OCR de descripciones y render
- Manuales y despieces
- Aplicar mejoras y extraer fotos
- Extracción de fotos v3 desde PDF
- Parseo del catálogo PDF
- Métricas y mapa de Argentina
- Gestión de vendedores
- Pantallas de login y aplicar mejora
- Entrar como vendedor (impersonación)
- Render de fotos v4
- Geometría del mapa argentino
- Aplicar Excel maestro
- Código LOGBELTS: armado y decodificación
- Sitio de prueba estático
- Extracción de descripciones v4
- Extracción de modelos y marcas
- Detalle de visitantes y acceso
- Registro de eventos y visitas
- Esquema de catálogo e importación
- Reordenar categorías del catálogo
- Tablas de eventos, visitas y visitantes
- Configuración, DB y media
- Navegación y sesión
- Alta de mejora (vendedor)
- Catálogo digital y cliente Supabase
- Set de iconos SVG
- Login de administrador
- Pipeline de extracción del catálogo
- Dependencias del proyecto
- Captura de foto (UI)
- Push de categorías a Supabase
- Aplicar fotos lote 2
- Normalización de siglas de marcas
- Push de correas 5888
- Push de fotos lote 2
- Metadatos de package.json
- Modelo de datos del catálogo
- Agregar correas faltantes
- Aplicar fotos al catálogo
- Consolidación final de fotos
- Extracción de códigos OEM
- Push de descripciones a Supabase
- Push del Excel maestro
- Seed inicial de Supabase
- Asociación foto-producto
- Categorías del catálogo y home
- Aplicar descripciones al catálogo
- Push de correas a Supabase
- Tipografía y design system
- Cámara: captura y stream
- Conversión de fotos CMYK
- Dependencias de desarrollo
- Scripts de npm
- Página de acceso
- Autenticación de administrador
- Confirmación de auth Supabase
- Normalizar correas 5888
- Títulos de cuchillas 3101
- Extracción de posiciones del PDF
- Configuración de Next.js
- Esquema MVP: mejoras y vendedores
- Tabla de despieces
- Merge de descripciones

## God Nodes (most connected - your core abstractions)
1. `leerTodos()` - 19 edges
2. `react` - 17 edges
3. `AdminHeader()` - 14 edges
4. `index()` - 14 edges
5. `getFamilias()` - 14 edges
6. `obtener()` - 13 edges
7. `MarcarRegion()` - 12 edges
8. `guardarUno()` - 12 edges
9. `Metricas()` - 11 edges
10. `base()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Datos a validar antes de publicar (teléfono, misión, canonical, PDFs)` --semantically_similar_to--> `Descripciones derivadas (878 genéricas)`  [INFERRED] [semantically similar]
  sitio-prueba/README.md → data/EXTRACCION.md
- `logbelts-catalogo (aplicación interna de mejoras de catálogo)` --conceptually_related_to--> `Sitio de prueba LOGBELTS (prototipo estático del rediseño)`  [INFERRED]
  README.md → sitio-prueba/README.md
- `Placeholders ph-*.svg para categorías sin foto real` --semantically_similar_to--> `fotos/ (1.525 imágenes recortadas del PDF)`  [INFERRED] [semantically similar]
  sitio-prueba/README.md → data/EXTRACCION.md
- `9 categorías de producto con anclas (#motosierras, #desmalezadoras, …)` --conceptually_related_to--> `Familias del catálogo (motosierras, desmalezadoras, minitractores, …)`  [INFERRED]
  sitio-prueba/productos.html → data/EXTRACCION.md
- `Sitio de prueba LOGBELTS (prototipo estático del rediseño)` --conceptually_related_to--> `Panel de administración /admin`  [AMBIGUOUS]
  sitio-prueba/README.md → data/MIGRACION-SUPABASE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Pipeline de regeneración del catálogo desde el PDF** — data_extraccion_extraer_posiciones, data_extraccion_pages_json, data_extraccion_parsear_catalogo, data_extraccion_extraer_fotos, data_extraccion_fotos_map_json, data_extraccion_aplicar_fotos, data_extraccion_productos_json, data_extraccion_productos_csv [EXTRACTED 1.00]
- **Esquema de tablas cat_* creado por 0004_catalogo.sql** — data_migracion_supabase_cat_productos, data_migracion_supabase_cat_categorias, data_migracion_supabase_cat_revisiones, data_migracion_supabase_cat_import_runs, data_migracion_supabase_cat_import_cambios, supabase_migrations_0004_catalogo [EXTRACTED 1.00]
- **Las 3 páginas comparten header, footer y design system duplicados** — sitio_prueba_index_home, sitio_prueba_productos_pagina_productos, sitio_prueba_contacto_pagina_contacto, sitio_prueba_readme_header_footer_duplicados, sitio_prueba_readme_design_system [EXTRACTED 1.00]

## Communities (73 total, 7 thin omitted)

### Community 0 - "Catálogo público y búsqueda"
Cohesion: 0.05
Nodes (63): BuscarPage(), dynamic, dynamic, SubcategoriaPage(), BotonAgregar(), toggle(), guardar(), leer() (+55 more)

### Community 1 - "Panel admin e importación Excel"
Cohesion: 0.05
Nodes (73): AdminHeader(), Categorias(), dynamic, importarExcel(), dynamic, GET(), runtime, AdminExcel() (+65 more)

### Community 2 - "Flujo de importación y revisión"
Cohesion: 0.10
Nodes (37): subirCatalogo(), aplicarImport(), decidirCambio(), decidirLote(), revertirImport(), dynamic, RevisarImport(), val() (+29 more)

### Community 3 - "Mejoras: marcar región de foto"
Cohesion: 0.08
Nodes (26): revisarMejora(), botonConfirmar, botones, botonRechazar, canvasWrap, card, contieneFoto(), errorText (+18 more)

### Community 4 - "OCR de descripciones y render"
Cohesion: 0.07
Nodes (16): APPLY, ARGV, doc, idx, N, pagesArg, PDF, productos (+8 more)

### Community 5 - "Manuales y despieces"
Cohesion: 0.15
Nodes (22): borrarDespiece(), DEST, guardarDespiece(), AdminManuales(), dynamic, maxDuration, dynamic, ManualesPage() (+14 more)

### Community 6 - "Aplicar mejoras y extraer fotos"
Cohesion: 0.11
Nodes (21): envolverTexto(), maxDuration, POST(), a85(), byConf, filtersOf(), fotoMap, imagesOfPage() (+13 more)

### Community 7 - "Extracción de fotos v3 desde PDF"
Cohesion: 0.10
Nodes (21): a85(), APPLY, codes, codigosValidos, COLS, csChannels(), filtersOf(), idx (+13 more)

### Community 8 - "Parseo del catálogo PDF"
Cohesion: 0.11
Nodes (20): BRAND_LC, BRANDS, byCode, clean(), COLS, decodeCodigo(), extractBits(), familiaFromClave() (+12 more)

### Community 9 - "Métricas y mapa de Argentina"
Cohesion: 0.13
Nodes (18): normalizarCiudad(), BarrasDias(), diaISO(), Donut(), dynamic, etiquetaDia(), fmt(), MapaArgentina() (+10 more)

### Community 10 - "Gestión de vendedores"
Cohesion: 0.13
Nodes (18): agregarVendedor(), cambiarActivo(), avatar, botonAgregar, botonToggle(), card, container, dynamic (+10 more)

### Community 11 - "Pantallas de login y aplicar mejora"
Cohesion: 0.12
Nodes (15): card, container, dynamic, emptyState, card, container, dynamic, emptyState (+7 more)

### Community 12 - "Entrar como vendedor (impersonación)"
Cohesion: 0.14
Nodes (16): avatar, entrarComo(), EntrarComoBoton(), iniciales(), nombreEstilo, userButton, BG_DARK, COLOR_CARD (+8 more)

### Community 13 - "Render de fotos v4"
Cohesion: 0.12
Nodes (11): APPLY, asignado, codes, codigosValidos, COLS, doc, idx, onlyPages (+3 more)

### Community 14 - "Geometría del mapa argentino"
Cohesion: 0.14
Nodes (15): anillo(), BBOX, BORDE_ARG, BORDE_CONTINENTE, BORDE_TDF, CIUDADES_AR, COS_LAT, DIVISIONES (+7 more)

### Community 15 - "Aplicar Excel maestro"
Cohesion: 0.12
Nodes (13): APPLY, ARGV, cambiosLog, codigosTocados, conflictos, filas, idx, noExisten (+5 more)

### Community 16 - "Código LOGBELTS: armado y decodificación"
Cohesion: 0.32
Nodes (11): ExplorarCodigos(), Codigos(), dynamic, GeneradorCodigo(), armarCodigo(), decodificarCodigo(), PRODUCTOS, RUBROS (+3 more)

### Community 17 - "Sitio de prueba estático"
Cohesion: 0.18
Nodes (15): Panel de administración /admin, RLS apagado y permisos abiertos (deuda de seguridad), Datos de contacto LOGBELTS (WhatsApp, email, dirección CABA), contacto.html — página de contacto, Formulario de pedido de repuesto (form[data-quote-form]), Anclas de home reutilizadas como secciones (#lanzamientos, #tutoriales, #distribuidores, #nosotros), Banda CTA hacia contacto / distribuidores, Hero de la home (El repuesto justo, cuando lo necesitás) (+7 more)

### Community 18 - "Extracción de descripciones v4"
Cohesion: 0.14
Nodes (9): ALL, APPLY, clean(), ej, encontrados, idx, productos, shortName() (+1 more)

### Community 19 - "Extracción de modelos y marcas"
Cohesion: 0.16
Nodes (12): add(), filas, mapa, MARCA_RE, MARCAS, MARCAS_MINITRACTOR, normMarca(), normModelo() (+4 more)

### Community 20 - "Detalle de visitantes y acceso"
Cohesion: 0.22
Nodes (11): DetalleVisitante(), dynamic, ETIQUETA_TIPO, dynamic, POST(), runtime, sanitizarNext(), leerEventosDeVisitante() (+3 more)

### Community 21 - "Registro de eventos y visitas"
Cohesion: 0.20
Nodes (11): dynamic, POST(), runtime, dynamic, POST(), runtime, leerTabla(), leerVisitas() (+3 more)

### Community 22 - "Esquema de catálogo e importación"
Cohesion: 0.22
Nodes (13): Tabla cat_import_cambios, Tabla cat_import_runs, cat_categorias, cat_import_cambios, cat_import_cambios_run_idx, cat_import_runs, cat_productos, cat_productos_codigo_trgm (+5 more)

### Community 23 - "Reordenar categorías del catálogo"
Cohesion: 0.14
Nodes (12): APPLY, BOBINA_VARIANTES, byCode, cambios, CATCHALL_LEGITIMO, DESC_ESCAPE, NO_ES_ESCAPE, original (+4 more)

### Community 24 - "Tablas de eventos, visitas y visitantes"
Cohesion: 0.20
Nodes (11): cat_eventos, cat_eventos_creado_idx, cat_eventos_tipo_creado_idx, cat_visitas, cat_visitas_creado_idx, cat_visitas_iphash_idx, cat_config, cat_eventos_visitante_idx (+3 more)

### Community 25 - "Configuración, DB y media"
Cohesion: 0.23
Nodes (8): cambiarGateClientes(), gateClientesActivo(), setGateClientes(), db, usandoDB, BUCKET, MAX_FOTO, MAX_VIDEO

### Community 26 - "Navegación y sesión"
Cohesion: 0.17
Nodes (12): logoImg, logoLink, logoutLink, Nav(), navBar, navLinks, obtenerUsuarioCookie(), pillLink (+4 more)

### Community 27 - "Alta de mejora (vendedor)"
Cohesion: 0.17
Nodes (12): backLink, button, cardCentered, container, errorText, inputStyle, label, NuevaMejora() (+4 more)

### Community 28 - "Catálogo digital y cliente Supabase"
Cohesion: 0.20
Nodes (10): bigButton, card, CatalogoDigital(), cargar(), container, errorText, cardStyle, SHADOW_SOFT (+2 more)

### Community 29 - "Set de iconos SVG"
Cohesion: 0.32
Nodes (11): base(), IconAdmin(), IconCamara(), IconCatalogo(), IconCheck(), IconFlecha(), IconMejora(), IconSalir() (+3 more)

### Community 30 - "Login de administrador"
Cohesion: 0.17
Nodes (10): AdminLogin(), cancelarBtn, entrarBtn, errorText, form, input, linea, separador (+2 more)

### Community 31 - "Pipeline de extracción del catálogo"
Cohesion: 0.22
Nodes (11): Extracción del catálogo LOGBELTS 2025/26 (primera pasada), extraer-posiciones.mjs (texto con posiciones desde el PDF), pages.json (texto posicionado commiteado), parsear-catalogo.mjs (pages.json → productos.json/csv), productos.csv (una fila por producto, para Excel), productos.json (catálogo en formato para el sistema), Reemplazo acotado del backend sin cambiar la interfaz de las páginas, lib/catalogo.js (capa de lectura del catálogo) (+3 more)

### Community 32 - "Dependencias del proyecto"
Cohesion: 0.18
Nodes (11): dependencies, @anthropic-ai/sdk, next, pdf-lib, @pdf-lib/fontkit, pdfjs-dist, react, react-dom (+3 more)

### Community 33 - "Captura de foto (UI)"
Cohesion: 0.20
Nodes (9): bigButton, columna, errorText, fab, fabLabel, fabSecundario, fila, secondaryButton (+1 more)

### Community 34 - "Push de categorías a Supabase"
Cohesion: 0.22
Nodes (9): codigos, env, extra, filas, get(), idx, productos, reporte (+1 more)

### Community 35 - "Aplicar fotos lote 2"
Cohesion: 0.22
Nodes (8): APPLY, ARGV, huerfanos, idx, nested, noExiste, pngs, productos

### Community 36 - "Normalización de siglas de marcas"
Cohesion: 0.22
Nodes (7): APPLY, CSV, ejemplos, FILE, productos, resumen, SIGLAS

### Community 37 - "Push de correas 5888"
Cohesion: 0.25
Nodes (8): codigos, env, filas, get(), idx, productos, sb, @supabase/supabase-js

### Community 38 - "Push de fotos lote 2"
Cohesion: 0.25
Nodes (8): codes, env, filas, get(), idx, nested, productos, sb

### Community 39 - "Metadatos de package.json"
Cohesion: 0.22
Nodes (8): name, private, version, mupdf, @napi-rs/canvas, next, react-dom, tesseract.js

### Community 40 - "Modelo de datos del catálogo"
Cohesion: 0.25
Nodes (8): Clave del código LOGBELTS (clave_rubro / clave_subrubro / clave_producto), Descripciones derivadas (878 genéricas), Columna estado (completo / derivado_con_foto / derivado_sin_foto / sin_codigo), familia vs familia_indice (conflicto de categorización), Familias del catálogo (motosierras, desmalezadoras, minitractores, …), fuente_desc (procedencia de la descripción), Revisión del equipo sobre el Excel (paso previo a la carga), Tabla cat_revisiones

### Community 41 - "Agregar correas faltantes"
Cohesion: 0.25
Nodes (6): APPLY, byCode, filas, MARCAS_POR_PAGINA, productos, yaExisten

### Community 42 - "Aplicar fotos al catálogo"
Cohesion: 0.29
Nodes (6): aplicacionDe(), COLS, M, P, st, titleCase()

### Community 43 - "Consolidación final de fotos"
Cohesion: 0.25
Nodes (7): APPLY, ARGV, huerfanos, idx, noExiste, pngs, productos

### Community 44 - "Extracción de códigos OEM"
Cohesion: 0.29
Nodes (6): APPLY, candidatos(), ejemplos, norm(), productos, REGLAS

### Community 45 - "Push de descripciones a Supabase"
Cohesion: 0.29
Nodes (7): codigos, env, filas, get(), idx, productos, sb

### Community 46 - "Push del Excel maestro"
Cohesion: 0.29
Nodes (7): env, filas, get(), idx, productos, reporte, sb

### Community 47 - "Seed inicial de Supabase"
Cohesion: 0.25
Nodes (5): cats, env, filas, productos, sb

### Community 48 - "Asociación foto-producto"
Cohesion: 0.29
Nodes (7): aplicar-fotos.mjs (aplica fotos y descripciones derivadas), Asociación de fotos por orden de aparición en la página, extraer-fotos.mjs (fotos + fotos-map.json), foto_confianza (media / baja / muy_baja), fotos/ (1.525 imágenes recortadas del PDF), fotos-map.json (mapa foto → código), Placeholders ph-*.svg para categorías sin foto real

### Community 49 - "Categorías del catálogo y home"
Cohesion: 0.29
Nodes (7): Tabla cat_categorias, Tabla cat_productos, npm run seed (carga idempotente por upsert), Sección #productos de la home (8 tarjetas de categoría), 9 categorías de producto con anclas (#motosierras, #desmalezadoras, …), Arquitectura preparada para crecer (anclas → páginas propias, Astro), Header y footer duplicados en las 3 páginas (limitación conocida)

### Community 50 - "Aplicar descripciones al catálogo"
Cohesion: 0.29
Nodes (6): APPLY, ARGV, desc, ej, idx, productos

### Community 51 - "Push de correas a Supabase"
Cohesion: 0.29
Nodes (5): correas, env, filas, productos, sb

### Community 52 - "Tipografía y design system"
Cohesion: 0.33
Nodes (7): Instrucciones para cargar las fuentes de marca reales, Fuentes comerciales excluidas del build por licencia, Opción A — @font-face con .woff2 propios, Opción B — Adobe Fonts (Typekit), Design system en styles.css (tokens en :root), logo.svg — recreación web del logo (azul #0a66c7), Tipografía de marca Dunk + Aktiv Grotesk con fallbacks Anton/Archivo

### Community 53 - "Cámara: captura y stream"
Cohesion: 0.40
Nodes (3): CapturaFoto(), capturarFoto(), detenerStream()

### Community 54 - "Conversión de fotos CMYK"
Cohesion: 0.40
Nodes (3): APPLY, DIRS, sharp

### Community 55 - "Dependencias de desarrollo"
Cohesion: 0.40
Nodes (5): devDependencies, mupdf, @napi-rs/canvas, sharp, tesseract.js

### Community 56 - "Scripts de npm"
Cohesion: 0.40
Nodes (5): scripts, build, dev, seed, start

### Community 57 - "Página de acceso"
Cohesion: 0.67
Nodes (3): Acceso(), dynamic, sanitizarNext()

### Community 60 - "Normalizar correas 5888"
Cohesion: 0.50
Nodes (3): APPLY, productos, tocados

### Community 61 - "Títulos de cuchillas 3101"
Cohesion: 0.50
Nodes (3): APPLY, productos, tocados

## Ambiguous Edges - Review These
- `Panel de administración /admin` → `Sitio de prueba LOGBELTS (prototipo estático del rediseño)`  [AMBIGUOUS]
  sitio-prueba/README.md · relation: conceptually_related_to

## Knowledge Gaps
- **385 isolated node(s):** `dynamic`, `dynamic`, `dynamic`, `runtime`, `dynamic` (+380 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 455 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Panel de administración /admin` and `Sitio de prueba LOGBELTS (prototipo estático del rediseño)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Catálogo público y búsqueda` to `Captura de foto (UI)`, `Panel admin e importación Excel`, `Mejoras: marcar región de foto`, `Metadatos de package.json`, `Código LOGBELTS: armado y decodificación`, `Navegación y sesión`, `Alta de mejora (vendedor)`, `Catálogo digital y cliente Supabase`, `Login de administrador`?**
  _High betweenness centrality (0.171) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `Push de correas 5888` to `Panel admin e importación Excel`, `Push de categorías a Supabase`, `Push de fotos lote 2`, `Metadatos de package.json`, `Gestión de vendedores`, `Push de descripciones a Supabase`, `Push del Excel maestro`, `Seed inicial de Supabase`, `Push de correas a Supabase`, `Configuración, DB y media`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `pdf-lib` connect `Aplicar mejoras y extraer fotos` to `Metadatos de package.json`, `Extracción de fotos v3 desde PDF`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `dynamic`, `dynamic`, `dynamic` to the rest of the system?**
  _385 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Catálogo público y búsqueda` be split into smaller, more focused modules?**
  _Cohesion score 0.05118601747815231 - nodes in this community are weakly interconnected._
- **Should `Panel admin e importación Excel` be split into smaller, more focused modules?**
  _Cohesion score 0.051055867415129644 - nodes in this community are weakly interconnected._