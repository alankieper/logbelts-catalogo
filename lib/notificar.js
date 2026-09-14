import { SITE_URL } from './seo';
import { waLink } from './telefono';

/**
 * Aviso por email de cada contacto nuevo al vendedor asignado (opcional).
 * Se activa con RESEND_API_KEY (resend.com). Destino: email del vendedor; si no tiene, AVISOS_EMAIL.
 * Remitente: AVISOS_FROM (un dominio verificado en Resend), por defecto el remitente de prueba de Resend.
 * Nunca frena el guardado del contacto.
 */
export async function avisarNuevoContacto(c, vendedor) {
  const key = process.env.RESEND_API_KEY;
  const para = vendedor?.email || process.env.AVISOS_EMAIL;
  if (!key || !para) return;

  const quien = [c.empresa, c.nombre].filter(Boolean).join(' · ') || 'Sin nombre';
  const wa = waLink(c.telefono, `Hola ${c.nombre || ''}, te escribo de Logbelts por tu consulta en la web.`);
  const texto = [
    `Nuevo contacto desde la web (${c.origen}).`,
    '',
    `Quién: ${quien}`,
    `Teléfono: ${c.telefono || '—'}${wa ? `  (WhatsApp: ${wa})` : ''}`,
    c.email ? `Email: ${c.email}` : null,
    `Zona: ${[c.localidad, c.provincia].filter(Boolean).join(', ') || '—'}`,
    c.consulta ? `\nConsulta:\n${c.consulta}` : null,
    '',
    vendedor ? `Asignado a: ${vendedor.nombre}` : 'Sin vendedor asignado.',
    `Seguimiento: ${SITE_URL}/admin/contactos`,
  ].filter(l => l !== null).join('\n');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.AVISOS_FROM || 'Logbelts Web <onboarding@resend.dev>',
      to: [para],
      subject: `Nuevo contacto web: ${quien}`,
      text: texto,
    }),
    cache: 'no-store',
  });
}
