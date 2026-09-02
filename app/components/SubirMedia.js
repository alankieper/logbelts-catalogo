'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { guardarMediaUrl } from '../admin/productoActions';

const MAX_FOTO = 15 * 1024 * 1024;
const MAX_VIDEO = 80 * 1024 * 1024;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

function ext(nombre, mime) {
  const e = (nombre || '').split('.').pop();
  if (e && /^[a-z0-9]{2,5}$/i.test(e)) return e.toLowerCase();
  if (/png/i.test(mime)) return 'png';
  if (/webp/i.test(mime)) return 'webp';
  if (/mp4/i.test(mime)) return 'mp4';
  if (/quicktime|mov/i.test(mime)) return 'mov';
  if (/webm/i.test(mime)) return 'webm';
  return /video/i.test(mime) ? 'mp4' : 'jpg';
}

export default function SubirMedia({ codigo }) {
  const input = useRef(null);
  const router = useRouter();
  const [estado, setEstado] = useState('idle'); // idle | subiendo | ok | error
  const [msg, setMsg] = useState('');

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('');
    if (!sb) { setEstado('error'); setMsg('Falta configurar Supabase.'); return; }

    const esVideo = /^video\//i.test(file.type) || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
    const clase = esVideo ? 'video' : 'foto';
    const tope = esVideo ? MAX_VIDEO : MAX_FOTO;
    if (file.size > tope) {
      setEstado('error');
      setMsg(`El archivo pesa ${(file.size / 1048576).toFixed(1)} MB. Máximo ${(tope / 1048576).toFixed(0)} MB.`);
      input.current.value = '';
      return;
    }

    setEstado('subiendo');
    setMsg(esVideo ? 'Subiendo video…' : 'Subiendo foto…');
    try {
      const ruta = `${clase}/${codigo}-${Date.now()}.${ext(file.name, file.type)}`;
      const { error } = await sb.storage.from('media').upload(ruta, file, {
        upsert: true,
        contentType: file.type || (esVideo ? 'video/mp4' : 'image/jpeg'),
      });
      if (error) {
        const hint = /bucket.*not.*found/i.test(error.message)
          ? 'Falta crear el bucket "media" en Supabase (migración 0007). '
          : /policy|not authorized|row-level/i.test(error.message)
            ? 'El bucket "media" no permite subir (faltan las políticas de la migración 0007). '
            : '';
        throw new Error(hint + error.message);
      }
      const pub = sb.storage.from('media').getPublicUrl(ruta).data.publicUrl;
      const fd = new FormData();
      fd.set('codigo', codigo);
      fd.set('campo', clase);
      fd.set('url', pub);
      const r = await guardarMediaUrl(fd);
      if (r && r.ok === false) throw new Error(r.error || 'No se pudo guardar.');
      setEstado('ok');
      setMsg(esVideo ? 'Video subido.' : 'Foto subida.');
      input.current.value = '';
      router.refresh();
    } catch (err) {
      setEstado('error');
      setMsg(err.message || 'No se pudo subir el archivo.');
      input.current.value = '';
    }
  }

  return (
    <div className="media-up">
      <label htmlFor={`m-${codigo}`}>Subir foto o video (reemplaza el actual)</label>
      <input
        id={`m-${codigo}`}
        ref={input}
        type="file"
        accept="image/*,video/*"
        onChange={onFile}
        disabled={estado === 'subiendo'}
      />
      {estado === 'subiendo' ? <span className="media-hint">{msg}</span> : null}
      {estado === 'ok' ? <span className="media-hint" style={{ color: 'var(--ok)' }}>{msg}</span> : null}
      {estado === 'error' ? <span className="media-hint" style={{ color: '#b3261e' }}>{msg}</span> : null}
      {estado === 'idle' ? (
        <span className="media-hint">Imagen: JPG / PNG / WEBP (máx. 15 MB) · Video: MP4 / MOV / WEBM (máx. 80 MB)</span>
      ) : null}
    </div>
  );
}
