# Despiece de la Stihl MS 660. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 660'
ARCHIVO = 'stihl-ms660.json'
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
    (1, 'Kit de juntas y membranas del carburador', '2209220', ['2209220'], celda(0, 0), A(470, 525), {'comp': 0.12}),
    (2, 'Carburador', '2202850', ['2202850'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Pistón y aros', '2204047', ['2204047'], celda(2, 0), A(660, 370), {'comp': 0.12}),
    (4, 'Juntas', '2210062', ['2210062'], celda(3, 0), A(1000, 460), {'comp': 0.12}),
    (5, 'Tapa de tanque', '2214034', ['2214034', '2214035'], celda(4, 0), A(215, 760), {'comp': 0.12}),
    (6, 'Tapa de arranque', '2215026', ['2215026'], celda(5, 0), A(640, 720), {'comp': 0.12}),
    (7, 'Traba giratoria', '2220194', ['2220194'], celda(6, 0), A(520, 465), {'comp': 0.12}),
    (8, 'Kit de tornillería', '2220210', ['2220210'], celda(7, 0), A(540, 640), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
