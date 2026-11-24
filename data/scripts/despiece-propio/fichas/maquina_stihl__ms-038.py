# Despiece de la Stihl MS 038. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 038'
ARCHIVO = 'stihl-ms038.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 968
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Kit de juntas y membranas del carburador', '2209213', ['2209213'], celda(0, 0), A(470, 525), {'comp': 0.12}),
    (2, 'Escape', '2203018', ['2203018'], celda(1, 0), A(1060, 420), {'comp': 0.12}),
    (3, 'Tapa de arranque', '2215074', ['2215074'], celda(2, 0), A(640, 720), {'comp': 0.12}),
    (4, 'Traba giratoria', '2220193', ['2220193'], celda(3, 0), A(520, 465), {'comp': 0.12}),
    (5, 'Kit de tornillería', '2220209', ['2220209'], celda(4, 0), A(540, 640), {'comp': 0.12}),
    (6, 'Sinfín de la bomba de aceite', '2220146', ['2220146'], celda(5, 0), A(1015, 780), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
