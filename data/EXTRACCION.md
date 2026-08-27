# Extracción del catálogo LOGBELTS 2025/26 — primera pasada

Este es el **contenido completo del catálogo pasado a datos**. Es la materia prima
para la base de datos de la web: todavía **no está revisado**, tiene huecos y
errores marcados. Sirve para que el equipo lo corrija y después cargarlo al sistema.

## Archivos

| Archivo | Qué es |
|---|---|
| `productos.csv` | **Abrilo con Excel.** Una fila por producto, todas las columnas. |
| `productos.json` | Lo mismo, en formato para el sistema. |
| `fotos/` | 1.525 fotos recortadas del PDF, nombradas `<codigo>.jpg`. |
| `scripts/` | Los programas que generaron todo, para repetirlo cuando cambie el catálogo. |

## Qué salió (números)

- **2.415 productos** detectados en las 176 páginas.
- **Categoría: 100%** — todos tienen familia y subcategoría (sacadas del código y del título de la página).
- **Descripción:**
  - 1.528 (63%) — **del texto del PDF** (`fuente_desc = texto del PDF`).
  - 878 (37%) — **derivadas** de la clave del código + la sección del catálogo (`fuente_desc = derivada…`). Ejemplo: "Kit de cilindros para Stihl", "Cigüeñal para Chinas 45cc / 52cc". **No están inventadas**, salen de datos del propio catálogo, pero son genéricas y hay que confirmarlas / precisarlas.
- **Fotos: 1.525 (63%)** asociadas a su código. Ver más abajo.
- **Código original (OEM): 16%** (396) — casi todo correas y cuchillas.
- **Marca: 52%** · **Medidas: 21%**.

### Columna `estado`

| Estado | Cant. | Significa |
|---|---|---|
| `completo` | 1.528 | Descripción sacada del texto del PDF |
| `derivado_con_foto` | 540 | Sin texto en el PDF; descripción genérica derivada + **tiene foto para revisar** |
| `derivado_sin_foto` | 338 | Sin texto y sin foto; descripción genérica derivada |
| `sin_codigo` | 7 | Marcados "a asignar" en el catálogo |

### Por familia

Motosierras 560 · Minitractores 456 · Desmalezadoras 413 · Motores 4T y generadores 393 ·
Máquinas de cortar césped 183 · Sistemas de arranque 116 · Juntas de motor 94 ·
Carburación 93 · Hidrolavadora y motobomba 49 · Repuestos universales 27 · Sopladoras 17 ·
Generadores 12 · Encendido 2.

## Fotos (`fotos/`)

- Se extrajeron las imágenes embebidas de cada página y se asociaron a los productos
  **por orden de aparición** en las páginas tipo grilla.
- **Confianza** (columna `foto_confianza`): `media` (648), `baja` (424), `muy_baja` (453).
- **Tienen errores de a uno** (la foto del producto de al lado). Hay que revisarlas mirando el Excel + la foto.
- Son de **baja resolución** (las del PDF). Se reemplazan por fotos en alta cuando estén.
- Las páginas tipo tabla (correas, etc.) **no tienen foto individual** en el catálogo → esos productos no tienen `foto`.

## Cómo leer el Excel

- **codigo** — código LOGBELTS de 7 dígitos.
- **estado** — ver tabla de arriba.
- **nombre / descripcion** — nombre corto y descripción. Ojo con `fuente_desc`.
- **fuente_desc** — `texto del PDF` (confiable) · `derivada…` (genérica, revisar).
- **familia** — según el **código** (rubro/sub-rubro de la clave de Valentina).
- **familia_indice** — según el **título de la página**. Si difiere de `familia`, decidir cuál vale.
- **subcategoria** — subcategoría (del título de la página).
- **marcas / codigo_original / medidas / ref_interna** — datos sueltos extraídos.
- **foto / foto_confianza** — nombre del archivo en `fotos/` y qué tan segura es la asociación.
- **clave_rubro / clave_subrubro / clave_producto** — el código descifrado.
- **pagina** — página del PDF de origen (para ir a mirar la original).
- **encabezado_pdf** — el título exacto de esa página del catálogo.

## Errores conocidos (los arregla la revisión del equipo)

1. **878 descripciones genéricas** (`fuente_desc = derivada`) → el PDF no tiene el texto. Hay que precisarlas: para qué máquina/modelo exacto es cada repuesto. Lo sabe el equipo, o se completa desde el panel de administración.
2. **Fotos con error de a uno** → revisar contra el Excel, sobre todo las de `foto_confianza = baja / muy_baja`.
3. **Páginas con dos secciones** → en algunas la subcategoría o la marca quedó mal (agarró la sección de al lado). `encabezado_pdf` ayuda a detectarlo.
4. **`familia` vs `familia_indice`** → a veces no coinciden. Ej.: un "kit de juntas de carburador para Stihl FS-38" el código lo pone en *Desmalezadoras* (la máquina) y el índice del catálogo en *Carburación* (la sección). Hay que fijar el criterio.
5. **Descripciones del texto con basura** (texto repetido, mayúsculas pegadas) → limpiar.
6. **~85 productos** que estimamos existen y no se detectaron (código solo dentro de una imagen, "a asignar", páginas con layout raro). Aparecen al revisar.

## Próximos pasos

1. **Revisión del equipo** sobre el Excel: precisar las 878 descripciones genéricas, corregir fotos mal asociadas, fijar categorías.
2. **Fotos en alta** cuando estén disponibles → reemplazan las de `fotos/`.
3. **Cargar a la base de datos** — recién cuando esté revisado.
4. (Opcional) repaso foto por foto de los 540 `derivado_con_foto` para ajustar descripciones antes de la revisión humana.

## Cómo se regenera (para técnicos)

```bash
# 1) texto con posiciones (necesita el PDF original)
node data/scripts/extraer-posiciones.mjs "<ruta al PDF>" data/scripts/pages.json
# 2) productos.json + productos.csv
node data/scripts/parsear-catalogo.mjs data/scripts/pages.json data/productos.json data/productos.csv
# 3) fotos + asociación
node data/scripts/extraer-fotos.mjs "<ruta al PDF>" data/scripts/pages.json data/fotos data/scripts/fotos-map.json
# 4) aplicar fotos + descripciones derivadas al csv/json
node data/scripts/aplicar-fotos.mjs data/productos.json data/scripts/fotos-map.json data/productos.csv
```

`pages.json` queda commiteado para re-parsear sin tener el PDF de 73 MB.
