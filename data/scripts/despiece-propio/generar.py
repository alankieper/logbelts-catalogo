"""Arma la ficha (maquina_xxx.py) de cada máquina a partir de sus repuestos del catálogo:
clasifica cada repuesto por tipo de pieza, agrupa los del mismo tipo, elige la foto a trazar,
y ubica cada pieza en la grilla con su punto en la máquina de fondo.
uso: python generar.py moto stihl__ms-180 husqvarna__61 ...
"""
import json, glob, os, re, sys, math, urllib.request

S = os.path.dirname(os.path.abspath(__file__))
FOTOS = os.path.join(S, 'wt', 'public', 'fotos')
CACHE = os.path.join(S, 'fotos-remotas'); os.makedirs(CACHE, exist_ok=True)

P = {}
for f in glob.glob(os.path.join(S, 'prod_*.json')):
    for p in json.load(open(f)):
        P[p['codigo']] = p
MODELOS = {r['k']: r for r in json.load(open(os.path.join(S, 'modelos.json')))}


def completar(c):
    """Repuestos que no están en la copia de la base (recodificados): se leen de su página publicada."""
    if c in P:
        return
    try:
        h = urllib.request.urlopen(f'https://logbelts-web.vercel.app/p/{c}', timeout=60).read().decode('utf8')
    except Exception:
        P[c] = {'codigo': c}
        return
    nombre = re.search(r'<title>(.*?) — código', h)
    img = re.search(r'og:image" content="[^"]*/fotos/([^"/]+)"', h)
    p = {'codigo': c, 'nombre': nombre.group(1) if nombre else c}
    if img:
        p['foto'] = img.group(1)
        viejo = P.get(os.path.splitext(img.group(1))[0])  # la foto suele ser la del código anterior
        if viejo:
            p['subcategoria'] = viejo.get('subcategoria')
            p['descripcion'] = viejo.get('descripcion')
    P[c] = p

# tipo, nombre de la pieza, regla, punto en la motosierra (vista de 2000 px del dibujo de Canva)
TIPOS_MOTO = [
    ('interruptor', 'Interruptor de encendido', r'interruptor', (430, 520)),
    ('tapa_filtro', 'Tapa del filtro y carcasa', r'tapa de fi ?ltro|cubierta|carcasa', (650, 270)),
    ('filtro', 'Filtro de aire', r'filtro', (650, 310)),
    ('membranas', 'Kit de juntas y membranas del carburador', r'kits de juntas y diafragmas|membrana|diafragma', (470, 525)),
    ('carburador', 'Carburador', r'carburador', (480, 500)),
    ('admision', 'Codo y brida de admisión', r'admisi[oó]n|brida|codo', (440, 520)),
    ('cebador', 'Varilla del cebador', r'cebador|choke', (385, 545)),
    ('acelerador', 'Acelerador', r'acelerador|gatillo', (262, 650)),
    ('cilindro', 'Cilindro y pistón', r'cilindro', (650, 340)),
    ('piston', 'Pistón y aros', r'pist[oó]n|\baros?\b', (660, 370)),
    ('ciguenal', 'Cigüeñal', r'cig[üu]e[ñn]al', (700, 620)),
    ('carter', 'Bloque de cárter', r'c[aá]rter', (660, 700)),
    ('reten', 'Retenes de aceite', r'ret[eé]n', (730, 660)),
    ('bobina', 'Bobina de encendido', r'bobina|encendido', (560, 520)),
    ('bujia', 'Bujía', r'buj[ií]a', (600, 450)),
    ('escape', 'Escape', r'escape|silenciador', (1060, 420)),
    ('juntas', 'Juntas', r'junta', (1000, 460)),
    ('tapa_tanque', 'Tapa de tanque', r'tapa (de )?tanque', (215, 760)),
    ('tanque_aceite', 'Tanque de aceite', r'tanque de aceite', (980, 860)),
    ('tanque', 'Tanque de combustible', r'tanque', (210, 800)),
    ('manguera', 'Mangueras', r'manguera', (410, 610)),
    ('resorte_arranque', 'Resorte de arranque', r'resorte (de )?arranque', (680, 745)),
    ('polea', 'Polea de arranque', r'polea', (705, 765)),
    ('arranque', 'Tapa de arranque', r'arranque|cazoleta', (640, 720)),
    ('silentblock', 'Silentblocks', r'silentblock|amortiguador', (330, 590)),
    ('manubrio', 'Manubrio', r'manubrio', (900, 300)),
    ('traba', 'Traba giratoria', r'traba', (520, 465)),
    ('tornilleria', 'Kit de tornillería', r'tornill', (540, 640)),
    ('sinfin', 'Sinfín de la bomba de aceite', r'sin ?f[ií]n', (1015, 780)),
    ('bomba', 'Bomba de aceite', r'bomba', (1000, 810)),
    ('tapa_pinon', 'Tapa de piñón', r'tapa de pi[ñn][oó]n', (990, 680)),
    ('resorte_embrague', 'Resorte de embrague', r'resorte (de )?embrague', (1000, 690)),
    ('embrague', 'Embrague y campana', r'campana|embrague', (1010, 700)),
    ('pinon', 'Piñón', r'pi[ñn][oó]n', (1020, 710)),
    ('cinta', 'Cinta de freno', r'cinta', (1045, 620)),
    ('manija_freno', 'Manija de freno', r'freno', (1120, 200)),
    ('tensor', 'Tensor de cadena', r'estira|tensor', (1060, 760)),
    ('garra', 'Garra de apoyo', r'garra', (1105, 560)),
    ('espada', 'Espada', r'espada', (1500, 690)),
    ('cadena', 'Cadena', r'cadena', (1500, 590)),
    ('valvulas', 'Válvulas de venteo y descompresión', r'v[aá]lvula', (600, 330)),
    ('otros', 'Otros repuestos', r'.', (650, 600)),
]


# ajustes de trazado por foto (los que ya se probaron a mano)
AJUSTES = {
    '2220180': {'comp': 0.6}, '2204031': {'comp': 0.15}, '2222030': {'comp': 0.3, 'lo': 25, 'hi': 80},
    '2222045': {'lo': 25, 'hi': 80}, '2224017': {'comp': 0.3}, '2203401': {'lo': 15, 'hi': 45},
    '2220068': {'lo': 25, 'hi': 70}, '2220135': {'recorte': [0.12, 0, 1, 1]}, '2221610': {'lo': 25, 'hi': 70},
    '2214067': {'lo': 15, 'hi': 45}, '2214068': {'lo': 15, 'hi': 45}, '2215045': {'lo': 20, 'hi': 60},
    '2220091': {'lo': 25, 'hi': 70}, '2220122': {'comp': 0.5}, '2220191': {'lo': 25, 'hi': 70},
    '2220165': {'lo': 25, 'hi': 70}, '2290517': {'invertir': True, 'comp': 0.5},
    '2291025': {'recorte': [0, 0.45, 0.75, 1], 'comp': 0.02},
}


def ajustes(c):
    aj = {'comp': 0.12}
    aj.update(AJUSTES.get(c, {}))
    return aj


def texto(p):
    return ' '.join(str(p.get(k) or '') for k in ('nombre', 'descripcion', 'subcategoria')).lower()


def clasificar(codigos, tipos):
    grupos = {}
    for c in codigos:
        t = texto(P.get(c, {}))
        for k, nombre, regla, ancla in tipos:
            if re.search(regla, t):
                grupos.setdefault(k, []).append(c)
                break
    return grupos


def foto_local(c):
    p = P.get(c, {})
    f = p.get('foto') or ''
    if f.startswith('http'):
        dest = os.path.join(CACHE, c + os.path.splitext(f.split('?')[0])[1])
        if not os.path.exists(dest):
            try:
                urllib.request.urlretrieve(f, dest)
            except Exception:
                return None
        # potrace/opencv no leen webp sin más: se convierte con opencv si hace falta
        return dest
    if f and os.path.exists(os.path.join(FOTOS, f)):
        return os.path.join(FOTOS, f)
    for e in ('png', 'jpg'):
        q = os.path.join(FOTOS, f'{c}.{e}')
        if os.path.exists(q):
            return q
    return None


def foto_de_tipo(k, tipos, evitar=()):
    """Foto de cualquier repuesto del catálogo del mismo tipo (cuando la pieza no tiene foto propia)."""
    for c in sorted(P):
        t = texto(P[c])
        for kk, _, regla, _ in tipos:
            if re.search(regla, t):
                if kk == k and c not in evitar and foto_local(c):
                    return c
                break
    return None


def ficha_moto(clave):
    m = MODELOS[clave]
    for c in m['cods']:
        completar(c)
    grupos = clasificar(m['cods'], TIPOS_MOTO)
    piezas = []
    for k, nombre, _, ancla in TIPOS_MOTO:
        if k not in grupos:
            continue
        cods = grupos[k]
        fuente = next((c for c in cods if foto_local(c)), None) or foto_de_tipo(k, TIPOS_MOTO)
        piezas.append((nombre, fuente, cods, ancla))
    n = len(piezas)
    cols = 8
    filas = math.ceil((n + 3) / cols)  # 3 casillas al final para el rótulo
    return piezas, cols, filas


PLANTILLA = '''# Despiece de la {maquina}. Generado por generar.py; lo lee componer.py.
MAQUINA = {maquina!r}
ARCHIVO = {archivo!r}
BASE_IMAGEN = 'canva/moto.png'
ANCHO, ALTO = 1800, {alto}
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
{piezas}
]
ROTULO = (C0 + {rc} * CW + 12, F0 + {rf} * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {extra!r}
'''


def escribir(clave):
    m = MODELOS[clave]
    piezas, cols, filas = ficha_moto(clave)
    lineas, extra = [], {}
    for i, (nombre, fuente, cods, ancla) in enumerate(piezas):
        col, fila = i % cols, i // cols
        aj = ajustes(fuente)
        if fuente and foto_local(fuente) and not os.path.basename(foto_local(fuente)).startswith(fuente + '.'):
            extra[fuente] = foto_local(fuente)
        lineas.append(f"    ({i + 1}, {nombre!r}, {fuente!r}, {cods!r}, celda({col}, {fila}), A{ancla}, {aj!r}),")
    # rótulo: las 3 últimas casillas de la última fila
    rc, rf = cols - 3, filas - 1
    alto = 520 + filas * 214 + 20
    archivo = clave.replace('__', '-').replace('-ms-', '-ms').replace('-fs-', '-fs') + '.json'
    txt = PLANTILLA.format(maquina=m['nombre'], archivo=archivo, alto=alto, piezas='\n'.join(lineas), rc=rc, rf=rf, extra=extra)
    out = os.path.join(S, 'fichas', f'maquina_{clave}.py')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w').write(txt)
    return out, len(piezas), len(m['cods'])


if __name__ == '__main__':
    for clave in sys.argv[2:]:
        out, n, r = escribir(clave)
        print(clave, n, 'piezas', r, 'repuestos', '->', os.path.basename(out))
