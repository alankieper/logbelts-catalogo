// Teléfonos argentinos -> número internacional para links de WhatsApp (wa.me/549XXXXXXXXXX).

export function telefonoWhatsApp(tel) {
  let d = String(tel || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('54')) {
    d = d.slice(2);
    if (d.startsWith('9')) d = d.slice(1);
  }
  d = d.replace(/^0/, '');
  // "15" local después del código de área (ej: 011 15 5555-5555 -> 11 5555-5555)
  if (d.length === 12) {
    for (const n of [2, 3, 4]) {
      if (d.slice(n, n + 2) === '15') { d = d.slice(0, n) + d.slice(n + 2); break; }
    }
  }
  if (d.length === 8) return `54911${d}`; // número de AMBA sin código de área
  if (d.length === 10) return `549${d}`;
  return d.length >= 8 ? `54${d}` : null;
}

export function waLink(tel, texto) {
  const n = telefonoWhatsApp(tel);
  if (!n) return null;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}
