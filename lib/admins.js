export const ADMIN_USUARIOS = ['Alan Kieper', 'Flor Faubel'];

export function esAdmin(nombre) {
  return ADMIN_USUARIOS.includes(nombre);
}
