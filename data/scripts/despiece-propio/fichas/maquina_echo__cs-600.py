# Despiece de la Echo CS 600. Generado por generar.py; lo lee componer.py.
MAQUINA = 'Echo CS 600'
ARCHIVO = 'echo-cs-600.json'
BASE_IMAGEN = 'motosierra-canva.png'
ANCHO, ALTO = 1800, 754
BX, BY, BS = 325, 34, 0.36
GUIAS = 'activa'
C0, F0, CW, CH = 12, 520, 222, 214


def A(x, y):
    return (x * 1.6, y * 1.6)


def celda(col, fila, ancho=1, mx=12, my=28):
    x, y = C0 + col * CW, F0 + fila * CH
    return (x + mx, y + my, CW * ancho - 2 * mx, CH - my - 10)


PIEZAS = [
    (1, 'Kit de juntas y membranas del carburador', '2109208', ['2109208', '2209209', '2209210'], celda(0, 0), A(470, 525), {'comp': 0.12}),
    (2, 'Carburador', '2202881', ['2202881'], celda(1, 0), A(480, 500), {'comp': 0.12}),
    (3, 'Espada', '2290535', ['2290535'], celda(2, 0), A(1500, 690), {'comp': 0.12}),
]
ROTULO = (C0 + 5 * CW + 12, F0 + 0 * CH + 20, 3 * CW - 24, CH - 40)
FOTOS_EXTRA = {'2109208': '/private/tmp/claude-502/-Users-alankieper--claude-spares-spare-JwqGkO/bdb2ee8a-f3f5-4bfe-a9da-bac05da5d67f/scratchpad/wt/public/fotos/2209208.jpg'}
