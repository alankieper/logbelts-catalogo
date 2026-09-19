import '../admin-extra.css';
import AdminHeader from '../AdminHeader';
import { fotosMaterial } from '../../../lib/material';
import { usandoDB } from '../../../lib/db';
import EditorMaterial from './EditorMaterial';

export const dynamic = 'force-dynamic';

export default async function AdminMaterial() {
  const fotos = await fotosMaterial();
  return (
    <>
      <AdminHeader activo="material" />
      <main className="adm">
        <div className="wrap">
          <h1>Material para distribuidores</h1>
          <p className="sub">
            Imágenes de producto del generador de placas de <a href="/material" target="_blank">/material</a>. Conviene que sean
            con fondo transparente (PNG) o blanco, y que se vea el producto entero.
          </p>
          {!usandoDB ? <div className="err-msg">Sin base de datos no se pueden guardar cambios.</div> : null}
          <EditorMaterial inicial={fotos} />
        </div>
      </main>
    </>
  );
}
