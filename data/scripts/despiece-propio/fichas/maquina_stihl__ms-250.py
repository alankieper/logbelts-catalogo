# Despiece de la Stihl MS 250. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 250'
ARCHIVO = 'stihl-ms250.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 1396
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
    (3, 'Kit de juntas y membranas del carburador', '2909035', ['2909035'], celda(2, 0), A(470, 525), {'comp': 0.12}),
    (4, 'Carburador', '2202803', ['2202803'], celda(3, 0), A(480, 500), {'comp': 0.12}),
    (5, 'Codo y brida de admisión', '2210012', ['2210012', '2220069'], celda(4, 0), A(440, 520), {'comp': 0.12}),
    (6, 'Varilla del cebador', '2220136', ['2220136'], celda(5, 0), A(385, 545), {'comp': 0.12}),
    (7, 'Pistón y aros', '2204034', ['2204034', '2205026'], celda(6, 0), A(660, 370), {'comp': 0.12}),
    (8, 'Cigüeñal', '2222033', ['2222033', '2222046'], celda(7, 0), A(700, 620), {'comp': 0.12}),
    (9, 'Escape', '2203015', ['2203015', '2210015'], celda(0, 1), A(1060, 420), {'comp': 0.12}),
    (10, 'Juntas', '2210011', ['2210011', '2210033'], celda(1, 1), A(1000, 460), {'comp': 0.12}),
    (11, 'Mangueras', '2220207', ['2220207', '2221611', '2221621', '2921016'], celda(2, 1), A(410, 610), {'comp': 0.12}),
    (12, 'Tapa de arranque', '2215018', ['2215018', '2215072', '2215082'], celda(3, 1), A(640, 720), {'comp': 0.12}),
    (13, 'Silentblocks', '2220092', ['2220092'], celda(4, 1), A(330, 590), {'comp': 0.12}),
    (14, 'Manubrio', '2220123', ['2220123'], celda(5, 1), A(900, 300), {'comp': 0.12}),
    (15, 'Traba giratoria', '2220192', ['2220192'], celda(6, 1), A(520, 465), {'comp': 0.12}),
    (16, 'Sinfín de la bomba de aceite', '2219049', ['2219049', '2219063', '2220143'], celda(7, 1), A(1015, 780), {'comp': 0.12}),
    (17, 'Embrague y campana', '2212076', ['2212076', '2212090'], celda(0, 2), A(1010, 700), {'comp': 0.12}),
    (18, 'Piñón', '2290532', ['2290532'], celda(1, 2), A(1020, 710), {'comp': 0.12}),
    (19, 'Manija de freno', '2220166', ['2220166'], celda(2, 2), A(1120, 200), {'comp': 0.12}),
    (20, 'Garra de apoyo', '2220080', ['2220080'], celda(3, 2), A(1105, 560), {'comp': 0.12}),
    (21, 'Espada', '2290541', ['2290541'], celda(4, 2), A(1500, 690), {'comp': 0.12}),
    (22, 'Cadena', '2291034', ['2291034'], celda(5, 2), A(1500, 590), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {'2909035': '/private/tmp/claude-502/-Users-alankieper--claude-spares-spare-JwqGkO/bdb2ee8a-f3f5-4bfe-a9da-bac05da5d67f/scratchpad/wt/public/fotos/2209035.jpg'}
