# Despiece de la Husqvarna 236. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Husqvarna 236'
ARCHIVO = 'husqvarna-236.json'
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
    (1, 'Filtro de aire', '4307663', ['4307663'], celda(0, 0), A(650, 310), {'comp': 0.12}),
    (2, 'Kit de juntas y membranas del carburador', '2209083', ['2209083'], celda(1, 0), A(470, 525), {'comp': 0.12}),
    (3, 'Cilindro y pistón', '2203061', ['2203061'], celda(2, 0), A(650, 340), {'comp': 0.12}),
    (4, 'Pistón y aros', '2204055', ['2204055'], celda(3, 0), A(660, 370), {'comp': 0.12}),
    (5, 'Bobina de encendido', '2224036', ['2224036'], celda(4, 0), A(560, 520), {'comp': 0.12}),
    (6, 'Juntas', '2110074', ['2110074'], celda(5, 0), A(1000, 460), {'comp': 0.12}),
    (7, 'Tapa de arranque', '2215028', ['2215028'], celda(6, 0), A(640, 720), {'comp': 0.12}),
    (8, 'Sinfín de la bomba de aceite', '2219056', ['2219056', '2219091'], celda(7, 0), A(1015, 780), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
