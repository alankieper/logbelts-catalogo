# Despiece de la Stihl MS 170. Lo lee componer.py.
MAQUINA = 'Stihl MS 170'
ARCHIVO = 'stihl-ms170.json'
BASE_IMAGEN = 'motosierra-canva.png'      # dibujo de línea generado en Canva (3200x1800), sin marca
ANCHO, ALTO = 1800, 1600
BX, BY, BS = 325, 34, 0.36           # ubicación de la máquina de fondo


def A(x, y):  # puntos medidos sobre la vista de 2000 px de ancho del dibujo de Canva
    return (x * 1.6, y * 1.6)
GUIAS = 'activa'                     # las guías se ven sólo en la pieza elegida (son muchas piezas)
C0, F0, CW, CH = 12, 520, 222, 214   # grilla debajo de la máquina: 8 columnas
COLS = 8


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


# n, nombre, foto a trazar, códigos, casilla, ancla (coordenadas del contorno), ajustes
PIEZAS = [
    # fila 0: motor
    (1, 'Cilindro y pistón', '2203041', ['2203041'], celda(0, 0), A(650, 340), {}),
    (2, 'Pistón y aros', '2204031', ['2204031', '2205022'], celda(1, 0), A(660, 370), {'comp': 0.15}),
    (3, 'Cigüeñal', '2222030', ['2222030'], celda(2, 0), A(700, 620), {'comp': 0.3, 'lo': 25, 'hi': 80}),
    (4, 'Bloque de cárter', '2222045', ['2222045'], celda(3, 0), A(660, 700), {'lo': 25, 'hi': 80}),
    (5, 'Retenes de aceite', '2227656', ['2227652', '2227656'], celda(4, 0), A(730, 660), {}),
    (6, 'Bobina de encendido', '2224017', ['2224017'], celda(5, 0), A(560, 520), {'comp': 0.3}),
    (7, 'Escape', '2203401', ['2203401', '2203014'], celda(6, 0), A(1060, 420), {'lo': 15, 'hi': 45}),
    (8, 'Juntas', '2210015', ['2210011', '2210012', '2210015', '2210050'], celda(7, 0), A(1000, 460), {}),
    # fila 1: admisión y combustible
    (9, 'Filtro de aire', '2207051', ['2207050', '2207051', '2207052'], celda(0, 1), A(650, 310), {}),
    (10, 'Carcasa superior', '2220180', ['2220180'], celda(1, 1), A(650, 270), {'comp': 0.6}),
    (11, 'Carburador', '2202802', ['2202802'], celda(2, 1), A(480, 500), {}),
    (12, 'Kit de membranas del carburador', '2209033', ['2209033'], celda(3, 1), A(470, 525), {}),
    (13, 'Codo y brida de admisión', '2220068', ['2220068', '2220093'], celda(4, 1), A(440, 520), {'lo': 25, 'hi': 70}),
    (14, 'Varilla del cebador', '2220135', ['2220135'], celda(5, 1), A(385, 545), {'recorte': [0.12, 0, 1, 1]}),
    (15, 'Mangueras', '2221610', ['2221610', '2921015'], celda(6, 1), A(410, 610), {'lo': 25, 'hi': 70}),
    (16, 'Tanque de combustible', '2214067', ['2214067', '2214031'], celda(7, 1), A(210, 800), {'lo': 15, 'hi': 45}),
    # fila 2: arranque, tanque de aceite y manijas
    (17, 'Tanque de aceite', '2214068', ['2214068'], celda(0, 2), A(980, 860), {'lo': 15, 'hi': 45}),
    (18, 'Tapa de arranque', '2215017', ['2215017', '2215049'], celda(1, 2), A(640, 720), {}),
    (19, 'Resorte de arranque', '2215040', ['2215040'], celda(2, 2), A(680, 745), {}),
    (20, 'Polea de arranque', '2215045', ['2215045'], celda(3, 2), A(705, 765), {'lo': 20, 'hi': 60}),
    (21, 'Silentblocks', '2220091', ['2220091'], celda(4, 2), A(330, 590), {'lo': 25, 'hi': 70}),
    (22, 'Manubrio', '2220122', ['2220122'], celda(5, 2), A(900, 300), {'comp': 0.5}),
    (23, 'Traba giratoria', '2220191', ['2220191'], celda(6, 2), A(520, 465), {'lo': 25, 'hi': 70}),
    (24, 'Kit de tornillería', '2220207', ['2220207'], celda(7, 2), A(540, 640), {}),
    # fila 3: lubricación, embrague, freno y cadena
    (25, 'Bomba de aceite', '2219049', ['2219049', '2220143'], celda(0, 3), A(1000, 810), {}),
    (26, 'Sinfín de la bomba de aceite', '2219063', ['2219063'], celda(1, 3), A(1015, 780), {}),
    (27, 'Campana de embrague', '2212089', ['2212089'], celda(2, 3), A(1010, 700), {}),
    (28, 'Tapa de piñón', '2215072', ['2215072'], celda(3, 3), A(990, 680), {}),
    (29, 'Cinta de freno', '2215082', ['2215082'], celda(4, 3), A(1045, 620), {}),
    (30, 'Manija de freno', '2220165', ['2220165'], celda(5, 3), A(1120, 200), {'lo': 25, 'hi': 70}),
    (31, 'Tensor de cadena', '2220061', ['2220060', '2220061'], celda(6, 3), A(1060, 760), {}),
    (32, 'Garra de apoyo', '2220080', ['2220080'], celda(7, 3), A(1105, 560), {}),
    # fila 4: espada y cadena (anchas)
    (33, 'Espada', '2290517', ['2290517'], celda(0, 4, 3), A(1500, 690), {'invertir': True, 'comp': 0.5}),
    (34, 'Cadena', '2291025', ['2291025'], celda(3, 4, 2), A(1500, 590), {'recorte': [0, 0.45, 0.75, 1], 'comp': 0.02}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 4 * CH + 20, 3 * CW - 24, CH - 40)
