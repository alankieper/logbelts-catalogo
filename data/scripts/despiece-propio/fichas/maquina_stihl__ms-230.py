# Despiece de la Stihl MS 230. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 230'
ARCHIVO = 'stihl-ms230.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 1182
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Tapa del filtro y carcasa', '2207015', ['2207015', '2220181'], celda(0, 0), A(650, 270), {'comp': 0.12}),
    (2, 'Filtro de aire', '2207053', ['2207053'], celda(1, 0), A(650, 310), {'comp': 0.12}),
    (3, 'Carburador', '2202803', ['2202803'], celda(2, 0), A(480, 500), {'comp': 0.12}),
    (4, 'Codo y brida de admisión', '2220069', ['2220069', '2220094'], celda(3, 0), A(440, 520), {'comp': 0.12}),
    (5, 'Varilla del cebador', '2220136', ['2220136'], celda(4, 0), A(385, 545), {'comp': 0.12}),
    (6, 'Cilindro y pistón', '2203039', ['2203039'], celda(5, 0), A(650, 340), {'comp': 0.12}),
    (7, 'Pistón y aros', '2204035', ['2204035', '2205025'], celda(6, 0), A(660, 370), {'comp': 0.12}),
    (8, 'Cigüeñal', '2222033', ['2222033', '2222046'], celda(7, 0), A(700, 620), {'comp': 0.12}),
    (9, 'Escape', '2203015', ['2203015', '2210015'], celda(0, 1), A(1060, 420), {'comp': 0.12}),
    (10, 'Juntas', '2210011', ['2210011', '2210033'], celda(1, 1), A(1000, 460), {'comp': 0.12}),
    (11, 'Mangueras', '2221611', ['2221611', '2221621', '2921016'], celda(2, 1), A(410, 610), {'comp': 0.12}),
    (12, 'Tapa de arranque', '2215018', ['2215018', '2215082'], celda(3, 1), A(640, 720), {'comp': 0.12}),
    (13, 'Silentblocks', '2220092', ['2220092'], celda(4, 1), A(330, 590), {'comp': 0.12}),
    (14, 'Manubrio', '2220123', ['2220123'], celda(5, 1), A(900, 300), {'comp': 0.12}),
    (15, 'Traba giratoria', '2220192', ['2220192'], celda(6, 1), A(520, 465), {'comp': 0.12}),
    (16, 'Sinfín de la bomba de aceite', '2219049', ['2219049', '2219063', '2220143'], celda(7, 1), A(1015, 780), {'comp': 0.12}),
    (17, 'Embrague y campana', '2212076', ['2212076', '2212090'], celda(0, 2), A(1010, 700), {'comp': 0.12}),
    (18, 'Manija de freno', '2220166', ['2220166'], celda(1, 2), A(1120, 200), {'comp': 0.12}),
    (19, 'Garra de apoyo', '2220080', ['2220080'], celda(2, 2), A(1105, 560), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 2 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
