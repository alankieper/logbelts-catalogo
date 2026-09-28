import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pruebas de lo que protege el panel.
 *
 * Son las más importantes de todas: si algo de esto se rompe sin que nadie se dé cuenta,
 * cualquiera podría entrar al panel. Se corren con `npm test`.
 */

process.env.AUTH_SECRET = 'secreto-de-prueba-que-no-se-usa-en-ningun-lado';
process.env.ADMIN_PASSWORD = 'contrasena-de-prueba';

const { crearSesion, leerSesion, opcionesCookie } = await import('../lib/sesion.js');
const { passwordCorrecta } = await import('../lib/adminPassword.js');
const { esperaAntiFuerzaBruta, olvidarIntentos } = await import('../lib/intentosLogin.js');

test('una sesión recién creada se reconoce', async () => {
  const cookie = await crearSesion('Admin');
  assert.ok(cookie, 'tiene que devolver un valor de cookie');
  assert.deepEqual(await leerSesion(cookie), { usuario: 'Admin' });
});

test('una cookie inventada se rechaza', async () => {
  assert.equal(await leerSesion('Admin'), null);
  assert.equal(await leerSesion('Admin.firma-falsa'), null);
  assert.equal(await leerSesion(''), null);
  assert.equal(await leerSesion(null), null);
});

test('si se cambia el contenido de la cookie, la firma deja de valer', async () => {
  const cookie = await crearSesion('Vendedor');
  const [datos, firma] = cookie.split('.');
  const otros = Buffer.from(JSON.stringify({ u: 'Admin', exp: Date.now() + 999999 }))
    .toString('base64url');
  assert.equal(await leerSesion(`${otros}.${firma}`), null, 'no puede aceptar otros datos con la firma vieja');
  assert.equal(await leerSesion(`${datos}.${firma}x`), null, 'no puede aceptar una firma retocada');
});

test('una sesión vencida no sirve', async () => {
  const datos = Buffer.from(JSON.stringify({ u: 'Admin', exp: Date.now() - 1000 })).toString('base64url');
  const cookie = await crearSesion('Admin');
  const firmaDeOtroContenido = cookie.split('.')[1];
  assert.equal(await leerSesion(`${datos}.${firmaDeOtroContenido}`), null);
});

test('la firma de un usuario no sirve para otro', async () => {
  const deVendedor = await crearSesion('Vendedor');
  const deAdmin = await crearSesion('Admin');
  const mezcla = `${deAdmin.split('.')[0]}.${deVendedor.split('.')[1]}`;
  assert.equal(await leerSesion(mezcla), null);
});

test('la cookie no se puede leer desde el navegador', () => {
  const o = opcionesCookie();
  assert.equal(o.httpOnly, true);
  assert.equal(o.sameSite, 'lax');
  assert.equal(o.path, '/');
});

test('la contraseña del panel se compara completa', () => {
  assert.equal(passwordCorrecta('contrasena-de-prueba'), true);
  assert.equal(passwordCorrecta('contrasena-de-prueb'), false, 'no alcanza con acertar el principio');
  assert.equal(passwordCorrecta('CONTRASENA-DE-PRUEBA'), false, 'distingue mayúsculas');
  assert.equal(passwordCorrecta(''), false);
  assert.equal(passwordCorrecta(null), false);
  assert.equal(passwordCorrecta(undefined), false);
});

test('después de varios intentos fallidos hay que esperar', () => {
  const ip = 'ip-de-prueba-1';
  olvidarIntentos(ip);
  assert.equal(esperaAntiFuerzaBruta(ip), 0, 'el primer intento es libre');
  for (let i = 0; i < 5; i++) esperaAntiFuerzaBruta(ip, true);
  assert.ok(esperaAntiFuerzaBruta(ip) > 0, 'al sexto intento tiene que frenar');
});

test('al entrar bien se borra el freno', () => {
  const ip = 'ip-de-prueba-2';
  olvidarIntentos(ip);
  for (let i = 0; i < 6; i++) esperaAntiFuerzaBruta(ip, true);
  assert.ok(esperaAntiFuerzaBruta(ip) > 0);
  olvidarIntentos(ip);
  assert.equal(esperaAntiFuerzaBruta(ip), 0);
});

test('el freno es por IP: uno no traba al otro', () => {
  const malo = 'ip-de-prueba-3';
  const bueno = 'ip-de-prueba-4';
  olvidarIntentos(malo);
  olvidarIntentos(bueno);
  for (let i = 0; i < 8; i++) esperaAntiFuerzaBruta(malo, true);
  assert.ok(esperaAntiFuerzaBruta(malo) > 0);
  assert.equal(esperaAntiFuerzaBruta(bueno), 0);
});
