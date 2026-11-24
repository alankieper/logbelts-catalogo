# Despiece de la Stihl MS 290. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 290'
ARCHIVO = 'stihl-ms290.json'
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
    (1, 'Carburador', '2202820', ['2202820'], celda(0, 0), A(480, 500), {'comp': 0.12}),
    (2, 'Cilindro y pistón', '2203046', ['2203046'], celda(1, 0), A(650, 340), {'comp': 0.12}),
    (3, 'Pistón y aros', '2204039', ['2204039'], celda(2, 0), A(660, 370), {'comp': 0.12}),
    (4, 'Tapa de tanque', '2214034', ['2214034', '2214035'], celda(3, 0), A(215, 760), {'comp': 0.12}),
    (5, 'Mangueras', '2221615', ['2221615'], celda(4, 0), A(410, 610), {'comp': 0.12}),
    (6, 'Tapa de arranque', '2215083', ['2215083'], celda(5, 0), A(640, 720), {'comp': 0.12}),
    (7, 'Silentblocks', '2220092', ['2220092'], celda(6, 0), A(330, 590), {'comp': 0.12}),
    (8, 'Traba giratoria', '2220192', ['2220192'], celda(7, 0), A(520, 465), {'comp': 0.12}),
    (9, 'Sinfín de la bomba de aceite', '2219042', ['2219042'], celda(0, 1), A(1015, 780), {'comp': 0.12}),
    (10, 'Embrague y campana', '2212079', ['2212079'], celda(1, 1), A(1010, 700), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 1 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
