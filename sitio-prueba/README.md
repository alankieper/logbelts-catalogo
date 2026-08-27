# LOGBELTS — Sitio de prueba (rediseño home)

Prototipo estático de la nueva web de **LOGBELTS**, con el contenido del negocio
real (**repuestos y maquinaria para agro, jardín y forestal**) tomado de
[www.logbelts.com](https://www.logbelts.com). Sin framework, sin build, sin
dependencias: archivos planos listos para subir a cualquier hosting estático.

## Contenido

```
sitio-prueba/
├── index.html            → Home (hero, barra de confianza, productos, aplicaciones,
│                            por qué LOGBELTS, cómo trabajamos, acerca de, CTA, footer)
├── productos.html        → 9 categorías reales + bloque distribuidores
├── contacto.html         → Formulario de contacto / pedido de repuesto / distribuidor
├── robots.txt · sitemap.xml · favicon.svg
└── assets/
    ├── css/styles.css    → Design system + estilos (tokens en :root, índice arriba)
    ├── js/main.js         → Header sticky, menú mobile, reveal on scroll, validación form
    ├── fonts/LEEME.txt    → Cómo cargar Dunk / Aktiv Grotesk reales
    └── img/
        ├── logo.svg              → Lockup LOGBELTS (recreación web: flecha + wordmark)
        ├── logo-original.png     → Logo real descargado del sitio (referencia)
        ├── photo-*.jpg           → Fotos reales de producto/uso de LOGBELTS
        └── ph-*.svg              → Placeholders azules para las categorías sin foto
```

## Cómo verlo localmente

Abrí `index.html`, o serví la carpeta:

```bash
npx serve sitio-prueba
```

## Cómo subirlo al servidor de prueba

Copiá **el contenido** de `sitio-prueba/` a la raíz pública (`public_html/`, `www/`,
`htdocs/`). No requiere Node ni PHP.

## Tipografía — Dunk + Aktiv Grotesk

Son las fuentes de marca (en el sitio actual están cargadas como *trial*). Este
build **no incluye los archivos** por licencia. El CSS las pide por nombre y usa
fallbacks libres cercanos: **Anton** (por Dunk) y **Archivo** (por Aktiv Grotesk),
desde Google Fonts. Los títulos van en mayúsculas e itálica para imitar el gesto
de Dunk Bold Italic. Para cargar las reales, ver [`assets/fonts/LEEME.txt`](assets/fonts/LEEME.txt)
y el comentario al inicio de [`assets/css/styles.css`](assets/css/styles.css).

## Logo y color

- `assets/img/logo.svg` es una **recreación web** del logo (isotipo de flecha +
  "Logbelts" + tagline). El archivo original está en `logo-original.png` para
  reemplazarlo si preferís usarlo tal cual.
- Azul principal `#0a66c7`, tomado del logo real. Se ajusta en `--blue-700` (y la
  escala `--blue-*`) en `styles.css`.

## Imágenes

Las `photo-*.jpg` son **fotos reales de LOGBELTS** descargadas de su sitio
(redimensionadas). Las `ph-*.svg` son placeholders para las categorías que hoy no
tienen foto (carburación, arranque, juntas, universales, desmalezadoras,
motobombas) — reemplazar por foto real cuando esté disponible.

## Datos a validar antes de publicar como definitivo

| Dato | Estado |
|---|---|
| Teléfono / WhatsApp `+54 9 11 6114-2012`, email `info@logbelts.com.ar`, dirección CABA | Tomados del sitio actual — **confirmar** |
| Misión / visión / valores | Reescritos a partir de la página "Acerca de" — **validar redacción final** |
| Descripciones de productos | Genéricas del rubro — ajustar al catálogo real |
| "+10 años" | Está en el sitio actual; se mantiene |
| Catálogos PDF por categoría | Los links van a contacto; falta subir los PDF |
| `canonical` / `og:url` / `sitemap.xml` | Usan `https://www.logbelts.com/` — cambiar si el dominio de prueba es otro |
| Lanzamientos / Tutoriales / Portal Distribuidores | Hoy son anclas dentro de la home; falta definir si son páginas propias |

## Arquitectura preparada para crecer

`productos.html` usa anclas por categoría (`#motosierras`, `#desmalezadoras`, …),
lista para pasar a páginas propias (`/productos/motosierras`) y fichas de producto
cuando haya catálogo. El contenido está separable a datos (array de categorías)
al migrar a un stack con templates (Astro recomendado).

## Limitación conocida

Header y footer están duplicados en las 3 páginas (HTML plano no tiene includes).
Se unifican en un componente al pasar a Astro u otro stack.
