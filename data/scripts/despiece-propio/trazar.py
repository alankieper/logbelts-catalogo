"""Traza una foto de producto (fondo blanco) a dibujo de linea: contorno exterior + bordes internos.
uso: python trazar.py foto.jpg salida.svg [umbral_canny_bajo] [umbral_alto]
Devuelve un SVG con un solo <path> relleno (las lineas son areas finas), viewBox ajustado al objeto.
"""
import sys, subprocess, tempfile, os, re
import numpy as np, cv2

src, out = sys.argv[1], sys.argv[2]
lo = int(sys.argv[3]) if len(sys.argv) > 3 else 40
hi = int(sys.argv[4]) if len(sys.argv) > 4 else 110
grosor = int(sys.argv[5]) if len(sys.argv) > 5 else 3
lado = int(sys.argv[6]) if len(sys.argv) > 6 else 900
min_area = int(sys.argv[7]) if len(sys.argv) > 7 else 60
comp = float(sys.argv[8]) if len(sys.argv) > 8 else 0.04
invertir = len(sys.argv) > 9 and sys.argv[9] == '1'
mascara_bordes = len(sys.argv) > 10 and sys.argv[10] == '1'
recorte = [float(v) for v in sys.argv[11].split(',')] if len(sys.argv) > 11 and sys.argv[11] else None

im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
if im.ndim == 3 and im.shape[2] == 4:  # png con transparencia -> fondo blanco
    a = im[:, :, 3:4] / 255.0
    im = (im[:, :, :3] * a + 255 * (1 - a)).astype(np.uint8)
if im.ndim == 2:
    im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGR)
if recorte:  # quedarse con una parte de la foto (x0,y0,x1,y1 en fracciones)
    H_, W_ = im.shape[:2]
    im = im[int(recorte[1] * H_):int(recorte[3] * H_), int(recorte[0] * W_):int(recorte[2] * W_)]
# trabajar a 900 px de lado mayor
h, w = im.shape[:2]
k = lado / max(h, w)
im = cv2.resize(im, (int(w * k), int(h * k)), interpolation=cv2.INTER_CUBIC)
if not invertir:
    # foto sobre fondo negro (como las cadenas y espadas): se detecta por el borde oscuro
    g_ = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    borde = np.concatenate([g_[:4].ravel(), g_[-4:].ravel(), g_[:, :4].ravel(), g_[:, -4:].ravel()])
    invertir = (borde < 60).mean() > 0.5 or (g_[g_.shape[0] // 8:-g_.shape[0] // 8, g_.shape[1] // 8:-g_.shape[1] // 8] < 30).mean() > 0.6
if invertir:
    # foto sobre un recuadro negro: recortar el recuadro y dar vuelta los colores
    g0 = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    x_, y_, w_, h_ = cv2.boundingRect((g0 < 60).astype(np.uint8))
    im = 255 - im[y_ + 6:y_ + h_ - 6, x_ + 6:x_ + w_ - 6]
im = cv2.copyMakeBorder(im, 20, 20, 20, 20, cv2.BORDER_CONSTANT, value=(255, 255, 255))

hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
gris = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
# objeto = lo que no es casi blanco
obj = ((gris < 238) | (hsv[:, :, 1] > 35)).astype(np.uint8) * 255
# algunas fotos tienen un recuadro gris claro detrás del producto: ese gris también es fondo
g_in = gris[30:-30, 30:-30]
claro = g_in[(g_in > 200)]
if claro.size > g_in.size * 0.3:
    fondo2 = int(np.median(claro))
    if fondo2 < 247:
        cuadro = ((np.abs(gris.astype(int) - fondo2) <= 6) & (hsv[:, :, 1] < 25)).astype(np.uint8)
        obj[cuadro > 0] = 0
# leyenda violeta "Logbelts code - 1234567" de algunas fotos: se borra por su color
violeta = (hsv[:, :, 0] >= 115) & (hsv[:, :, 0] <= 160) & (hsv[:, :, 1] > 50)
violeta = cv2.dilate(violeta.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
obj[violeta] = 0
if mascara_bordes:
    # pieza blanca sobre fondo blanco: el fondo es lo que se llena desde el borde sin cambiar de tono
    ff = np.zeros((gris.shape[0] + 2, gris.shape[1] + 2), np.uint8)
    g2 = cv2.GaussianBlur(gris, (3, 3), 0).copy()
    cv2.floodFill(g2, ff, (0, 0), 0, loDiff=2, upDiff=2, flags=4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8))
    obj = (ff[1:-1, 1:-1] == 0).astype(np.uint8) * 255
obj = cv2.morphologyEx(obj, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
# sacar la sombra/reflejo gris que traen muchas fotos debajo del producto (franja chata y ancha)
n0, lab0, st0, _ = cv2.connectedComponentsWithStats(obj)
for i in range(1, n0):
    ww0, hh0 = st0[i, cv2.CC_STAT_WIDTH], st0[i, cv2.CC_STAT_HEIGHT]
    y0_ = st0[i, cv2.CC_STAT_TOP]
    if hh0 < ww0 * 0.07 and ww0 > obj.shape[1] * 0.2:
        obj[lab0 == i] = 0
    # leyenda "Logbelts code - 1234567" que traen algunas fotos abajo: renglón bajo y ancho en el último cuarto
    elif hh0 < obj.shape[0] * 0.06 and ww0 > hh0 * 4 and y0_ > obj.shape[0] * 0.5:
        obj[lab0 == i] = 0
# quedarse con componentes grandes (saca textos y sombras chicas)
n, lab, st, _ = cv2.connectedComponentsWithStats(obj)
area_max = st[1:, cv2.CC_STAT_AREA].max() if n > 1 else 0
mask = np.zeros_like(obj)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] >= area_max * comp:
        mask[lab == i] = 255
# rellenar huecos interiores para el contorno exterior
cont, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
lleno = np.zeros_like(mask)
cv2.drawContours(lleno, cont, -1, 255, -1)

# bordes internos
suave = cv2.bilateralFilter(im, 9, 60, 60)
bordes = cv2.Canny(cv2.cvtColor(suave, cv2.COLOR_BGR2GRAY), lo, hi)
interior = cv2.erode(lleno, np.ones((9, 9), np.uint8))
bordes[interior == 0] = 0
# contorno exterior como linea
borde_ext = cv2.morphologyEx(lleno, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
# si la pieza toca el borde de la foto (está cortada), ese borde no es contorno: se saca para que no quede un marco
m_ = 24
borde_ext[:m_ + 2, :] = 0; borde_ext[-m_ - 2:, :] = 0; borde_ext[:, :m_ + 2] = 0; borde_ext[:, -m_ - 2:] = 0
lineas = cv2.bitwise_or(bordes, borde_ext)
lineas = cv2.dilate(lineas, np.ones((grosor, grosor), np.uint8))
# sacar pedacitos sueltos
n, lab, st, _ = cv2.connectedComponentsWithStats(lineas)
limpio = np.zeros_like(lineas)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] >= min_area:
        limpio[lab == i] = 255

x, y, ww, hh = cv2.boundingRect(lleno)
pad = 6
x0, y0 = max(0, x - pad), max(0, y - pad)
rec = limpio[y0:y + hh + pad, x0:x + ww + pad]
with tempfile.TemporaryDirectory() as td:
    pbm = os.path.join(td, 'a.pbm')
    cv2.imwrite(pbm, 255 - rec)
    subprocess.run(['potrace', '-s', '-t', '25', '-a', '1.1', '-O', '1.5', '-u', '5', pbm, '-o', os.path.join(td, 'a.svg')], check=True)
    svg = open(os.path.join(td, 'a.svg')).read()
open(out, 'w').write(svg)
print(out, rec.shape[1], rec.shape[0])
