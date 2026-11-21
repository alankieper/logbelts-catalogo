"""Recorta el fondo de las fotos de producto: deja el repuesto sobre transparencia.

- Fondos de estudio (blanco o negro): relleno por inundación desde los bordes.
- Fondos de césped: se quitan los píxeles verdes conectados al borde.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

def mascara_fondo(a, modo, tol=26):
    """True donde hay fondo. `a` es HxWx3 float."""
    h, w, _ = a.shape
    visto = np.zeros((h, w), bool)
    if modo == 'verde':
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        parecido = (g > r * 1.08) & (g > b * 1.08) & (g > 40)
    else:
        semillas = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
        color = np.median(semillas, axis=0)
        parecido = np.sqrt(((a - color) ** 2).sum(axis=2)) < tol
    # inundación desde los bordes sobre los píxeles "parecidos al fondo"
    cola = deque()
    for x in range(w):
        for y in (0, h - 1):
            if parecido[y, x] and not visto[y, x]:
                visto[y, x] = True; cola.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if parecido[y, x] and not visto[y, x]:
                visto[y, x] = True; cola.append((y, x))
    while cola:
        y, x = cola.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and parecido[ny, nx] and not visto[ny, nx]:
                visto[ny, nx] = True; cola.append((ny, nx))
    return visto

def recortar(entrada, salida, modo='auto', tol=26, lado=900):
    im = Image.open(entrada).convert('RGB')
    im.thumbnail((lado, lado))
    a = np.asarray(im).astype(float)
    if modo == 'auto':
        bordes = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
        modo = 'estudio' if bordes.std(axis=0).mean() < 22 else 'verde'
    fondo = mascara_fondo(a, modo, tol)
    alpha = Image.fromarray(((~fondo) * 255).astype('uint8'))
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA'); out.putalpha(alpha)
    caja = out.getbbox()
    if caja:
        out = out.crop(caja)
    out.save(salida)
    return modo, round(float(fondo.mean()) * 100), out.size

if __name__ == '__main__':
    ent, sal = sys.argv[1], sys.argv[2]
    modo = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    tol = float(sys.argv[4]) if len(sys.argv) > 4 else 26
    print(recortar(ent, sal, modo, tol))
