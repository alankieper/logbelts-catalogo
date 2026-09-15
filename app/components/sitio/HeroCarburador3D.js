'use client';

import { useEffect, useRef, useState } from 'react';
import { Carburador } from './LineasRepuestos';

// Modelo exportado de Meshy (formato GLB). Si el archivo no está, se muestra el carburador hecho en código.
const MODELO = '/modelos/carburador.glb';

/** Carburador 3D del hero: gira solo y se puede arrastrar. */
export default function HeroCarburador3D() {
  const contenedor = useRef(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | sin-webgl

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return undefined;
    let limpiar = () => {};
    let cancelado = false;

    const iniciar = async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (cancelado) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        setEstado('sin-webgl');
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      renderer.domElement.setAttribute('aria-hidden', 'true');

      const escena = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      escena.add(new THREE.AmbientLight(0x8fb0ff, 0.3));
      const clave = new THREE.DirectionalLight(0xffffff, 2.4);
      clave.position.set(4, 6, 6);
      escena.add(clave);
      const contra = new THREE.DirectionalLight(0x5b8cff, 2.6);
      contra.position.set(-5, -1, -4);
      escena.add(contra);

      const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camara.position.set(0, 0.5, 9);
      camara.lookAt(0, 0, 0);

      // Modelo de Meshy si existe; si no, el hecho en código
      let modelo = null;
      let recursos = [];
      try {
        const r = await fetch(MODELO, { method: 'HEAD' });
        if (r.ok) {
          const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
          modelo = (await new GLTFLoader().loadAsync(MODELO)).scene;
          modelo.traverse((o) => {
            if (o.isMesh) {
              recursos.push(o.geometry);
              (Array.isArray(o.material) ? o.material : [o.material]).forEach((mat) => {
                recursos.push(mat);
                Object.values(mat).forEach((v) => { if (v?.isTexture) recursos.push(v); });
              });
            }
          });
        }
      } catch { modelo = null; }
      if (!modelo) {
        const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
        const { construirCarburador } = await import('./modelos3d/carburador');
        ({ grupo: modelo, recursos } = construirCarburador(THREE, RoundedBoxGeometry));
      }
      if (cancelado) { recursos.forEach((x) => x.dispose()); renderer.dispose(); pmrem.dispose(); return; }

      // Centrar y escalar
      const caja = new THREE.Box3().setFromObject(modelo);
      const medida = caja.getSize(new THREE.Vector3());
      modelo.position.sub(caja.getCenter(new THREE.Vector3()));
      const pieza = new THREE.Group();
      pieza.add(modelo);
      pieza.scale.setScalar(3.4 / Math.max(medida.x, medida.y, medida.z));
      const soporte = new THREE.Group();
      soporte.add(pieza);
      soporte.rotation.set(0.3, -0.6, 0);
      escena.add(soporte);

      el.appendChild(renderer.domElement);
      const ajustar = () => {
        const { width, height } = el.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camara.aspect = width / height;
        camara.updateProjectionMatrix();
      };
      ajustar();
      const ro = new ResizeObserver(ajustar);
      ro.observe(el);

      const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
      const lienzo = renderer.domElement;
      let arrastrando = false;
      let ultimoX = 0;
      let impulso = 0;
      const bajar = (e) => { arrastrando = true; ultimoX = e.clientX; lienzo.setPointerCapture(e.pointerId); lienzo.style.cursor = 'grabbing'; };
      const mover = (e) => {
        if (!arrastrando) return;
        const dx = e.clientX - ultimoX;
        ultimoX = e.clientX;
        soporte.rotation.y += dx * 0.01;
        impulso = dx * 0.6;
      };
      const soltar = () => { arrastrando = false; lienzo.style.cursor = 'grab'; };
      lienzo.style.touchAction = 'pan-y';
      lienzo.addEventListener('pointerdown', bajar);
      lienzo.addEventListener('pointermove', mover);
      lienzo.addEventListener('pointerup', soltar);
      lienzo.addEventListener('pointercancel', soltar);

      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(el);

      const reloj = new THREE.Clock();
      let t = 0;
      renderer.setAnimationLoop(() => {
        const dt = Math.min(reloj.getDelta(), 0.05);
        if (!visible) return;
        if (!arrastrando) {
          soporte.rotation.y += ((reducir.matches ? 0 : 0.45) + impulso) * dt;
          impulso *= 0.94;
        }
        if (!reducir.matches) {
          t += dt;
          pieza.position.y = Math.sin(t * 1.3) * 0.08;
        }
        renderer.render(escena, camara);
      });
      setEstado('listo');

      limpiar = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        io.disconnect();
        lienzo.removeEventListener('pointerdown', bajar);
        lienzo.removeEventListener('pointermove', mover);
        lienzo.removeEventListener('pointerup', soltar);
        lienzo.removeEventListener('pointercancel', soltar);
        recursos.forEach((x) => x.dispose());
        escena.environment?.dispose();
        pmrem.dispose();
        renderer.dispose();
        lienzo.remove();
      };
    };

    iniciar().catch(() => setEstado('sin-webgl'));
    return () => {
      cancelado = true;
      limpiar();
    };
  }, []);

  return (
    <div ref={contenedor} className="carbu-hero" data-estado={estado} role="img" aria-label="Carburador en 3D, arrastrá para girarlo">
      <Carburador className="carbu-hero__respaldo" />
    </div>
  );
}
