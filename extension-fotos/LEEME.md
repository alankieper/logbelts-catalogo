# Extensión "Logbelts · Fotos del catálogo"

Sirve para conseguir fotos nuevas para los productos del catálogo que no tienen foto o la tienen en mala calidad.

## Instalar (una sola vez)

1. En Chrome, abrí `chrome://extensions`.
2. Prendé **Modo de desarrollador** (arriba a la derecha).
3. Clic en **Cargar descomprimida** y elegí esta carpeta (`logbelts-catalogo\extension-fotos`).
4. Tocá el ícono de la pieza de rompecabezas en la barra de Chrome y fijá (📌) la extensión.

## Usar

1. Clic en el ícono de la extensión: se abre el **panel lateral** con el producto actual.
2. Tocá **Google Imágenes**, **Mercado Libre** o **Amazon**: se busca el producto en la pestaña actual.
   Si el producto tiene **código original** (OEM), aparece un botón para buscar ese número exacto.
3. Mantené **Alt** y pasá el mouse: se marca la foto y arriba muestra su medida real
   (verde = buena, naranja = chica o ya usada para otro producto).
4. **Alt + clic** sobre la foto → se guarda y el panel pasa solo al siguiente producto.
   - Si la foto es chica (menos de 600px), se guarda igual pero **no avanza**, para que busques una mejor.
     La segunda se guarda como `<codigo>-2.jpg`.
   - Si esa misma foto ya la guardaste para otro producto, avisa y no la guarda.
     Para guardarla igual: **Shift + Alt + clic**.
   - Plan B: clic derecho sobre la foto → **Guardar foto para el producto actual**.
5. **Saltar →** si no encontrás nada para ese producto.

Siempre intenta bajar la foto en tamaño original (Amazon, Mercado Libre, tiendas WordPress y Shopify).
El **Orden** "Más vistos" usa las visitas registradas en la página para empezar por lo que más mira la gente.

## Pasar las fotos a la página

Desde la carpeta `logbelts-catalogo`:

```
node data/scripts/importar-fotos-extension.mjs --supabase
```

- Usa la foto de mayor resolución de cada código, la deja cuadrada (máx. 1000×1000), JPG y con fondo blanco.
- Guarda las fotos viejas en `data/fotos-respaldo/<fecha>/`.
- Mueve las originales a `Descargas\fotos-catalogo\importadas\<fecha>\` y las saca de la lista de la extensión
  (recargá la extensión en `chrome://extensions` para ver la lista actualizada).
- Para que se vean en la web falta commit + push (deploy en Vercel). Pedíselo a Claude.

## Pestañas: Página web / Catálogo físico

- **Página web**: productos de logbelts-catalogo.vercel.app sin foto o con foto chica
  (`lista.json`, se regenera con `node data/scripts/generar-lista-extension.mjs`).
- **Catálogo físico**: fotos que le faltan al catálogo impreso (InDesign "Catalogo Logbelts 2026 - FINAL"):
  placeholders de la planilla de Cowork, fotos de otro producto, fotos con marca de agua/logo y "MEJORAR ALAN"
  (`lista-fisico.json`, se regenera con `node data/scripts/generar-lista-fisico.mjs`).
  Estas fotos se guardan aparte, en `Descargas\fotos-catalogo-fisico\`.
- Cada pestaña tiene su propio progreso. Si ya bajaste una foto de ese código en la otra pestaña, el panel te avisa.

## Dónde quedan las fotos

`Descargas\fotos-catalogo\<codigo>.jpg` (el mismo nombre que usa la página).
Con **Exportar registro (Excel)** se genera `registro-fotos.csv` con cada foto, su medida y de qué página salió.

## Consejos

- Si Chrome pregunta dónde guardar cada archivo: Configuración → Descargas → apagá "Preguntar dónde se guardará cada archivo".
- Si recargás la extensión, recargá también (F5) las páginas que tenías abiertas.
- `lista.json` tiene los productos pendientes. Para regenerarla (por ejemplo, después de subir fotos), pedíselo a Claude.
- Excluidos a pedido: correas de mini tractor, cuchillas de mini tractor y aros de pistón.
