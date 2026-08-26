// Este archivo lo importan tanto componentes de cliente (Nav) como el
// middleware, así que no puede tener nada sensible (ver lib/adminPassword.js
// para la contraseña, que solo se importa server-side).
export const ADMIN_USUARIOS = ['Admin'];

export function esAdmin(nombre) {
  return ADMIN_USUARIOS.includes(nombre);
}
