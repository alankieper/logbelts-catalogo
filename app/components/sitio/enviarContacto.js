// Envía un contacto de la web a /api/sitio/contacto (queda en cat_visitantes, visible en Métricas).
// Nunca tira error: si la base no está disponible devuelve { ok: false } y la UI ofrece WhatsApp.
export async function enviarContacto(datos) {
  try {
    const r = await fetch('/api/sitio/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    return await r.json();
  } catch {
    return { ok: false };
  }
}
