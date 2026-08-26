// Importar SOLO desde código server-side (route handlers, server actions).
// Nunca desde un componente 'use client' ni desde middleware.js, para que
// no termine en el bundle que baja al navegador.
export const ADMIN_PASSWORD = '1234';
