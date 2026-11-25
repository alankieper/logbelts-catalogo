'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { agregarMediaGaleria, pedirSubidaMedia } from '../admin/productoActions';

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

/**
 * Sube una foto o un video y lo agrega al producto (no reemplaza nada):
 * si todavía no tiene foto de portada, la usa como portada; si no, la suma
 * a la galería (o a la lista de videos). Se pueden subir varias fotos/videos,
 * una por una.
 */
export default function SubirMedia({ codigo }) {
  const input = useRef(null);
  const router = useRouter();
  const [estado, setEstado] = useState('idle'); // idle | subiendo | ok | error
  const [msg, setMsg] = useState('');

  const [arrastrando, setArrastrando] = useState(false);

  async function onFile(e) {
    await subir(e.target.files?.[0]);
  }

  function onDrop(e) {
    e.preventDefault();
    setArrastrando(false);
    if (estado === 'subiendo') return;
    subir(e.dataTransfer.files?.[0]);
  }

  async function subir(file) {
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
      // el servidor autoriza esta subida puntual (ver pedirSubidaMedia)
      const permiso = await pedirSubidaMedia({ codigo, clase, extension: ext(file.name, file.type) });
      if (!permiso.ok) throw new Error(permiso.error || 'No se pudo pedir permiso para subir.');
      const { error } = await sb.storage.from('media').uploadToSignedUrl(permiso.ruta, permiso.token, file, {
        contentType: file.type || (esVideo ? 'video/mp4' : 'image/jpeg'),
      });
      if (error) {
        const hint = /bucket.*not.*found/i.test(error.message) ? 'Falta crear el bucket "media" en Supabase (migración 0007). ' : '';
        throw new Error(hint + error.message);
      }
      const pub = permiso.url;
      const fd = new FormData();
      fd.set('codigo', codigo);
      fd.set('tipo', clase);
      fd.set('url', pub);
      const r = await agregarMediaGaleria(fd);
      if (r && r.ok === false) throw new Error(r.error || 'No se pudo guardar.');
      setEstado('ok');
      setMsg(esVideo ? 'Video agregado.' : 'Foto agregada.');
      input.current.value = '';
      router.refresh();
    } catch (err) {
      setEstado('error');
      setMsg(err.message || 'No se pudo subir el archivo.');
      input.current.value = '';
    }
  }

  const subiendo = estado === 'subiendo';
  return (
    <div className="mp-subir">
      <label
        htmlFor={`m-${codigo}`}
        className={`mp-zona${arrastrando ? ' is-sobre' : ''}${subiendo ? ' is-subiendo' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!arrastrando) setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={onDrop}
      >
        <span className="mp-zona-ic" aria-hidden="true">
          {subiendo ? <span className="mp-spin" /> : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
          )}
        </span>
        <span className="mp-zona-txt">
          <strong>{subiendo ? msg : 'Agregar foto o video'}</strong>
          <span>{subiendo ? 'Esperá un momento…' : 'Hacé clic o arrastrá el archivo acá'}</span>
        </span>
        <input
          id={`m-${codigo}`}
          ref={input}
          type="file"
          accept="image/*,video/*"
          onChange={onFile}
          disabled={subiendo}
          className="mp-oculto"
        />
      </label>
      {estado === 'ok' ? <p className="mp-msg mp-msg--ok" role="status">✓ {msg}</p> : null}
      {estado === 'error' ? <p className="mp-msg mp-msg--error" role="alert">{msg}</p> : null}
      <p className="mp-ayuda">Fotos JPG, PNG o WEBP (hasta 15 MB) · Videos MP4, MOV o WEBM (hasta 80 MB). Si el producto no tiene portada, la primera foto pasa a ser la portada.</p>
    </div>
  );
}
