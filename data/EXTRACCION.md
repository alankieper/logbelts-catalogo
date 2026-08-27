# Extracción del catálogo LOGBELTS 2025/26 — primera pasada

Este es el **contenido completo del catálogo pasado a datos**. Es la materia prima
para la base de datos de la web: todavía **no está revisado**, tiene huecos y
errores marcados. Sirve para que el equipo lo corrija y después cargarlo al sistema.

## Archivos

| Archivo | Qué es |
|---|---|
| `productos.csv` | **Abrilo con Excel.** Una fila por producto, todas las columnas. |
| `productos.json` | Lo mismo, en formato para el sistema (no hace falta abrirlo). |
| `scripts/` | Los programas que generaron esto, para poder repetirlo cuando cambie el catálogo. |

## Qué salió (números)

- **2.415 productos** detectados en las 176 páginas.
- **Categoría: 100%** (todos tienen familia y subcategoría, sacadas del código y del título de la página).
- **Descripción: 64%** (1.537). El 36% restante (**880 productos**) **no tiene descripción en el texto del PDF** — está dentro de las fotos o directamente falta. Quedaron marcados `falta_descripcion`.
- **Código original (OEM): 16%** (396). Casi todo son correas y cuchillas; el resto del catálogo casi no trae el código original en el texto.
- **Marca: 52%** · **Medidas: 21%**.

### Por estado (columna `estado`)

| Estado | Cantidad | Significa |
|---|---|---|
| `completo` | 1.528 | Tiene nombre/descripción utilizable |
| `falta_descripcion` | 880 | Está el código y la categoría, falta el texto |
| `sin_codigo` | 7 | Marcados "a asignar" en el catálogo |

### Por familia

Motosierras 560 · Minitractores 456 · Desmalezadoras 413 · Motores 4T y generadores 393 ·
Máquinas de cortar césped 183 · Sistemas de arranque 116 · Juntas de motor 94 ·
Carburación 93 · Hidrolavadora y motobomba 49 · Repuestos universales 27 · Sopladoras 17 ·
Generadores 12 · Encendido 2.

## Cómo leer el Excel

Columnas principales:

- **codigo** — código LOGBELTS de 7 dígitos.
- **estado** — `completo` / `falta_descripcion` / `sin_codigo` (ver arriba).
- **nombre** — nombre corto (armado automáticamente).
- **descripcion** — texto tal cual salió del PDF (puede tener basura, hay que limpiarlo).
- **familia** — familia según el **código** (rubro/sub-rubro de la clave que pasó Valentina).
- **familia_indice** — familia según el **título de la página** del catálogo. Cuando difiere de `familia`, decidir cuál vale.
- **subcategoria** — subcategoría (del título de la página).
- **marcas / codigo_original / medidas / ref_interna** — datos sueltos que se pudieron extraer.
- **clave_rubro / clave_subrubro / clave_producto** — el código descifrado con la tabla de Valentina.
- **pagina** — página del PDF de donde salió (para ir a mirar la original).
- **encabezado_pdf** — el título exacto de la página (referencia para revisar).

## Errores conocidos (los va a arreglar la revisión)

1. **880 productos sin descripción** → el PDF no tiene ese texto. Hay que completarlos mirando las fotos del catálogo, o desde el panel de administración más adelante.
2. **Páginas con dos secciones** → en algunas, la subcategoría o la marca quedó mal (agarró el título de la sección de al lado). La columna `encabezado_pdf` ayuda a detectarlo.
3. **Descripciones con texto repetido o en MAYÚSCULAS pegado** → sobras del PDF, hay que limpiarlas.
4. **`familia` vs `familia_indice`** → a veces no coinciden. Ejemplo: un "kit de juntas de carburador para Stihl FS-38" el código lo pone en *Desmalezadoras* (la máquina) y el índice del catálogo en *Carburación* (la sección). Hay que decidir el criterio.
5. **Fotos** → todavía no se asociaron. Es el paso siguiente.

## Qué falta (próximos pasos)

1. **Repaso con IA de los 880 huecos** — mirar la imagen de cada producto sin descripción y completarla. Va por lotes, lleva varias sesiones.
2. **Fotos** — extraer las ~2.000 imágenes del PDF y asociarlas a cada código.
3. **Revisión del equipo** — sobre el Excel, corregir nombres, categorías y lo que la IA haya interpretado mal.
4. **Cargar a la base de datos** — recién cuando esté revisado.

## Cómo se regenera (para técnicos)

```bash
# 1. Extraer texto con posiciones del PDF (necesita el PDF original)
node data/scripts/extraer-posiciones.mjs "<ruta al Catalogo_Logbelts_2026_GASTON_v3.pdf>" data/scripts/pages.json

# 2. Parsear a productos.json + productos.csv
node data/scripts/parsear-catalogo.mjs data/scripts/pages.json data/productos.json data/productos.csv
```

`pages.json` (el texto crudo del PDF con coordenadas) queda commiteado para poder
re-parsear sin tener el PDF de 73 MB a mano.
