"""Arma el despiece de la Stihl FS 120: traza cada pieza, la ubica en su casilla y escribe
- despiece-fs120.json (datos para la web)
- _lab/despiece.svg (vista de prueba)
"""
import json, os, re, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
WT = os.path.join(S, 'wt')
FOTOS = os.path.join(WT, 'public', 'fotos')
TMP = os.path.join(S, 'trazos'); os.makedirs(TMP, exist_ok=True)
PY = os.path.join(S, 'venv', 'bin', 'python')

ANCHO, ALTO = 1800, 1000
# máquina de base (contorno de la portada), coordenadas de su viewBox
BX, BY, BS = 30, 30, 0.95
def maq(u, v):
    return (BX + BS * u, BY + BS * v)

PX_POR_U = 4      # resolución del trazado: 4 px por unidad del dibujo
GROSOR = 4        # px -> 1 unidad de línea en todas las piezas

C0, F0, CW, CH = 840, 24, 236, 238  # grilla de la derecha
def celda(col, fila, mx=14, my=26):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW - 2 * mx, CH - my - 10)

# n, nombre, foto a trazar, códigos, casilla, ancla en la máquina (coordenadas de la base), ajustes de trazado
PIEZAS = [
    (1, 'Tapa del filtro de aire', '2107118', ['2107118'], celda(0, 0), (640, 70), {}),
    (2, 'Filtro de aire', '2107132', ['2107132'], celda(1, 0), (634, 88), {'lo': 120, 'hi': 260}),
    (3, 'Caja filtrera completa', '2107140', ['2107140'], celda(2, 0), (626, 104), {}),
    (4, 'Carburador', '2102822', ['2102701', '2102702', '2102822'], celda(3, 0), (604, 124), {}),
    (5, 'Manguera de combustible', '2121062', ['2121062'], celda(0, 1), (592, 148), {}),
    (6, 'Juntas de motor', '2110059', ['2110059'], celda(1, 1), (566, 140), {}),
    (7, 'Cilindro y pistón', '2103014', ['2103014'], celda(2, 1), (530, 36), {}),
    (8, 'Pistón y aros', '2104034', ['2104034', '2105025'], celda(3, 1), (548, 58), {'comp': 0.15}),
    (9, 'Cigüeñal', '2122136', ['2122136'], celda(0, 2), (520, 118), {'lo': 25, 'hi': 80}),
    (10, 'Bobina de encendido', '2124231', ['2124231'], celda(1, 2), (492, 48), {'comp': 0.3}),
    (11, 'Campana de embrague', '2112081', ['2112081'], celda(2, 2), (480, 228), {'lo': 140, 'hi': 300}),
    (12, 'Resorte de embrague', '2112100', ['2112100'], celda(3, 2), (470, 212), {'lo': 70, 'hi': 180}),
    (13, 'Tapa de arranque', '2115065', ['2115065'], celda(0, 3), (462, 98), {}),
    (14, 'Resorte de arranque', '2115112', ['2115112'], celda(1, 3), (468, 116), {}),
    (15, 'Cable del acelerador', '2125165', ['2125165'], (470, 430, 300, 290), (726, 300), {}),
    (16, 'Caja de engranajes', '2113046', ['2113029', '2113046', '2113047'], (330, 770, 330, 210), (139, 850), {}),
]


def foto(c):
    for e in ('png', 'jpg'):
        p = os.path.join(FOTOS, f'{c}.{e}')
        if os.path.exists(p):
            return p
    raise SystemExit(f'sin foto {c}')


def trazar(c, lado, aj):
    out = os.path.join(TMP, f'{c}.svg')
    args = [PY, '-I', os.path.join(S, 'trazar.py'), foto(c), out,
            str(aj.get('lo', 40)), str(aj.get('hi', 110)), str(GROSOR), str(lado), str(aj.get('min', 140)), str(aj.get('comp', 0.04))]
    r = subprocess.run(args, capture_output=True, text=True, check=True)
    _, w, h = r.stdout.split()
    svg = open(out).read()
    g = re.search(r'<g transform="([^"]+)"', svg).group(1)
    paths = re.findall(r'<path d="([^"]+)"', svg)
    return int(w), int(h), g, ' '.join(p.replace('\n', ' ') for p in paths)


def recortar_linea(ax, ay, caja):
    """Punto del borde de la caja sobre la recta ancla -> centro de la caja."""
    x, y, w, h = caja
    cx, cy = x + w / 2, y + h / 2
    dx, dy = ax - cx, ay - cy
    t = min(abs((w / 2) / dx) if dx else 9e9, abs((h / 2) / dy) if dy else 9e9)
    return cx + dx * t, cy + dy * t


datos = []
for n, nombre, cf, cods, caja, ancla, aj in PIEZAS:
    x, y, w, h = caja
    # primero un trazado de prueba para saber la proporción, después al tamaño final
    w0, h0, _, _ = trazar(cf, 400, aj)
    s_fit = min(w / w0, h / h0)
    lado = int(round(max(w0, h0) * s_fit * PX_POR_U))
    tw, th, gt, d = trazar(cf, lado, aj)
    s = min(w / tw, h / th)
    ox, oy = x + (w - tw * s) / 2, y + (h - th * s) / 2
    ax, ay = maq(*ancla)
    bx, by, bw, bh = ox, oy, tw * s, th * s
    lx, ly = recortar_linea(ax, ay, (bx - 6, by - 6, bw + 12, bh + 12))
    datos.append({
        'n': n, 'nombre': nombre, 'codigos': cods,
        'caja': [round(bx, 1), round(by, 1), round(bw, 1), round(bh, 1)],
        'transform': f'translate({ox:.2f} {oy:.2f}) scale({s:.4f}) {gt}',
        'd': d,
        'linea': [round(ax, 1), round(ay, 1), round(lx, 1), round(ly, 1)],
        'numero': [round(x - 2, 1), round(y - 12, 1)],
    })
    print(n, cf, f'lado={lado}', f's={s:.3f}', file=sys.stderr)

# máquina de base
base = open(os.path.join(WT, 'public', '_lab', 'base.svg')).read()
bg = re.search(r'<g transform="([^"]+)"[^>]*>(.*)</g>', base, re.S)
base_paths = re.findall(r' d="([^"]+)"', bg.group(2))
salida = {
    'maquina': 'Stihl FS 120', 'ancho': ANCHO, 'alto': ALTO,
    'base': {'transform': f'translate({BX} {BY}) scale({BS}) {bg.group(1)}', 'd': base_paths},
    'piezas': datos,
}
json.dump(salida, open(os.path.join(S, 'despiece-fs120.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
os.makedirs(os.path.join(WT, 'public', 'dibujos-despiece'), exist_ok=True)
json.dump(salida, open(os.path.join(WT, 'public', 'dibujos-despiece', 'stihl-fs120.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

# vista de prueba
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ANCHO} {ALTO}" width="1500" style="background:#fff;font-family:sans-serif">']
o.append(f'<g transform="{salida["base"]["transform"]}" fill="none" stroke="#9aa6b8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">')
o += [f'<path d="{p}"/>' for p in base_paths]
o.append('</g>')
for p in datos:
    a = p['linea']
    o.append(f'<line x1="{a[0]}" y1="{a[1]}" x2="{a[2]}" y2="{a[3]}" stroke="#9aa6b8" stroke-width="1.2" stroke-dasharray="4 4"/>')
    o.append(f'<circle cx="{a[0]}" cy="{a[1]}" r="3" fill="#9aa6b8"/>')
    o.append(f'<g transform="{p["transform"]}" fill="#13284b"><path d="{p["d"]}"/></g>')
    nx, ny = p['numero']
    o.append(f'<circle cx="{nx+12}" cy="{ny+12}" r="12" fill="#13284b"/><text x="{nx+12}" y="{ny+16.5}" font-size="13" font-weight="700" fill="#fff" text-anchor="middle">{p["n"]}</text>')
o.append('</svg>')
open(os.path.join(WT, 'public', '_lab', 'despiece.svg'), 'w').write('\n'.join(o))
print('ok', file=sys.stderr)
