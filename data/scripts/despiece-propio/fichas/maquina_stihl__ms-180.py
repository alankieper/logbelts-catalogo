# Despiece de la Stihl MS 180. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Stihl MS 180'
ARCHIVO = 'stihl-ms180.json'
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
    (1, 'Tapa del filtro y carcasa', '2220180', ['2220180'], celda(0, 0), A(650, 270), {'comp': 0.6}),
    (2, 'Filtro de aire', '2207052', ['2207052'], celda(1, 0), A(650, 310), {'comp': 0.12}),
    (3, 'Kit de juntas y membranas del carburador', '2209033', ['2209033'], celda(2, 0), A(470, 525), {'comp': 0.12}),
    (4, 'Carburador', '2202802', ['2202802', '2202822', '2210050'], celda(3, 0), A(480, 500), {'comp': 0.12}),
    (5, 'Codo y brida de admisión', '2220068', ['2220068', '2220093'], celda(4, 0), A(440, 520), {'comp': 0.12, 'lo': 25, 'hi': 70}),
    (6, 'Varilla del cebador', '2220135', ['2220135'], celda(5, 0), A(385, 545), {'comp': 0.12, 'recorte': [0.12, 0, 1, 1]}),
    (7, 'Cilindro y pistón', '2203042', ['2203042'], celda(6, 0), A(650, 340), {'comp': 0.12}),
    (8, 'Pistón y aros', '2204032', ['2204032', '2205023'], celda(7, 0), A(660, 370), {'comp': 0.12}),
    (9, 'Cigüeñal', '2222031', ['2222031', '2222045'], celda(0, 1), A(700, 620), {'comp': 0.12}),
    (10, 'Bobina de encendido', '2224017', ['2224017'], celda(1, 1), A(560, 520), {'comp': 0.3}),
    (11, 'Escape', '2203014', ['2203014', '2203401', '2210015'], celda(2, 1), A(1060, 420), {'comp': 0.12}),
    (12, 'Juntas', '2210011', ['2210011', '2210033'], celda(3, 1), A(1000, 460), {'comp': 0.12}),
    (13, 'Tanque de aceite', '2214068', ['2214068'], celda(4, 1), A(980, 860), {'comp': 0.12, 'lo': 15, 'hi': 45}),
    (14, 'Tanque de combustible', '2214067', ['2214067'], celda(5, 1), A(210, 800), {'comp': 0.12, 'lo': 15, 'hi': 45}),
    (15, 'Mangueras', '2220207', ['2220207', '2221610', '2921015'], celda(6, 1), A(410, 610), {'comp': 0.12}),
    (16, 'Resorte de arranque', '2215040', ['2215040'], celda(7, 1), A(680, 745), {'comp': 0.12}),
    (17, 'Polea de arranque', '2215045', ['2215045'], celda(0, 2), A(705, 765), {'comp': 0.12, 'lo': 20, 'hi': 60}),
    (18, 'Tapa de arranque', '2215017', ['2215017', '2215049', '2215072', '2215082'], celda(1, 2), A(640, 720), {'comp': 0.12}),
    (19, 'Manubrio', '2220122', ['2220122'], celda(2, 2), A(900, 300), {'comp': 0.5}),
    (20, 'Traba giratoria', '2220191', ['2220191'], celda(3, 2), A(520, 465), {'comp': 0.12, 'lo': 25, 'hi': 70}),
    (21, 'Sinfín de la bomba de aceite', '2219049', ['2219049', '2219063', '2220143'], celda(4, 2), A(1015, 780), {'comp': 0.12}),
    (22, 'Embrague y campana', '2212089', ['2212089'], celda(5, 2), A(1010, 700), {'comp': 0.12}),
    (23, 'Manija de freno', '2220165', ['2220165'], celda(6, 2), A(1120, 200), {'comp': 0.12, 'lo': 25, 'hi': 70}),
    (24, 'Tensor de cadena', '2220060', ['2220060', '2220061'], celda(7, 2), A(1060, 760), {'comp': 0.12}),
    (25, 'Garra de apoyo', '2220080', ['2220080'], celda(0, 3), A(1105, 560), {'comp': 0.12}),
    (26, 'Cadena', '2291026', ['2291026'], celda(1, 3), A(1500, 590), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 3 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {}
