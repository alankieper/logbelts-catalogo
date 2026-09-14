'use client';

import { useEffect, useRef, useState } from 'react';
import { Piston } from './LineasRepuestos';

/**
 * Pistón con biela en 3D (Three.js), modelado con geometría propia. Gira solo y se puede arrastrar.
 * Three.js se carga recién cuando el bloque está cerca de la pantalla; si no hay WebGL queda el dibujo de línea.
 * Con "reducir movimiento" activado no gira solo.
 */
export default function Piston3D() {
  const contenedor = useRef(null);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | sin-webgl

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
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
      renderer.domElement.setAttribute('aria-hidden', 'true');
      el.appendChild(renderer.domElement);

      const escena = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camara.position.set(0, 0.2, 9.5);

      escena.add(new THREE.AmbientLight(0x8fb0ff, 0.35));
      const clave = new THREE.DirectionalLight(0xffffff, 2.2);
      clave.position.set(4, 6, 6);
      escena.add(clave);
      const contra = new THREE.DirectionalLight(0x5b8cff, 2.5);
      contra.position.set(-5, -2, -4);
      escena.add(contra);

      const acero = new THREE.MeshStandardMaterial({ color: 0xd4dbe8, metalness: 1, roughness: 0.28, side: THREE.DoubleSide });
      const aceroOscuro = new THREE.MeshStandardMaterial({ color: 0x8e9ab0, metalness: 1, roughness: 0.38 });
      const lineas = new THREE.LineBasicMaterial({ color: 0x8fb0ff, transparent: true, opacity: 0.28 });
      const pieza = new THREE.Group();
      const geometrias = [];

      const agregar = (geo, mat, config) => {
        geometrias.push(geo);
        const malla = new THREE.Mesh(geo, mat);
        const bordes = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineas);
        geometrias.push(bordes.geometry);
        malla.add(bordes);
        if (config) config(malla);
        pieza.add(malla);
        return malla;
      };

      // Pistón: perfil de revolución con 3 ranuras de aros, cabeza apenas abombada y falda.
      const perfil = [
        [0.86, -0.6], [0.86, -1.5], [0.97, -1.5], [1.0, -1.3], [1.0, 0.0],
        [1.0, 0.12], [0.92, 0.12], [0.92, 0.2], [1.0, 0.2],
        [1.0, 0.34], [0.92, 0.34], [0.92, 0.42], [1.0, 0.42],
        [1.0, 0.56], [0.92, 0.56], [0.92, 0.64], [1.0, 0.64],
        [1.0, 0.82], [0.97, 0.88], [0.8, 0.92], [0.45, 0.95], [0, 0.96],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      agregar(new THREE.LatheGeometry(perfil, 96), acero);

      // Perno del pistón (atraviesa la falda).
      agregar(new THREE.CylinderGeometry(0.26, 0.26, 2.06, 48), aceroOscuro, (m) => {
        m.rotation.z = Math.PI / 2;
        m.position.y = -0.7;
      });

      // Biela: ojo chico, cuerpo en doble T y ojo grande con tapa.
      const anillo = (rExt, rInt) => {
        const s = new THREE.Shape();
        s.absarc(0, 0, rExt, 0, Math.PI * 2, false);
        const h = new THREE.Path();
        h.absarc(0, 0, rInt, 0, Math.PI * 2, true);
        s.holes.push(h);
        return s;
      };
      const extruir = (forma, prof) => {
        const g = new THREE.ExtrudeGeometry(forma, { depth: prof, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 40 });
        g.translate(0, 0, -prof / 2);
        return g;
      };
      const biela = new THREE.Group();
      const piezaBiela = (geo) => {
        geometrias.push(geo);
        const m = new THREE.Mesh(geo, aceroOscuro);
        const b = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lineas);
        geometrias.push(b.geometry);
        m.add(b);
        biela.add(m);
        return m;
      };
      piezaBiela(extruir(anillo(0.4, 0.27), 0.3)).position.y = -0.7;
      const cuerpo = new THREE.Shape();
      cuerpo.moveTo(-0.14, -1.02);
      cuerpo.lineTo(0.14, -1.02);
      cuerpo.lineTo(0.3, -2.62);
      cuerpo.lineTo(-0.3, -2.62);
      cuerpo.closePath();
      piezaBiela(extruir(cuerpo, 0.22));
      piezaBiela(extruir(anillo(0.72, 0.5), 0.34)).position.y = -3.2;
      const bulon = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 16);
      [-0.62, 0.62].forEach((x) => { piezaBiela(bulon).position.set(x, -3.2, 0); });
      biela.rotation.y = Math.PI / 2;
      pieza.add(biela);

      pieza.position.y = 1.3;
      const soporte = new THREE.Group();
      soporte.add(pieza);
      soporte.rotation.x = 0.22;
      escena.add(soporte);

      // Tamaño, arrastre y animación.
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
      let velocidad = reducir.matches ? 0 : 0.35;
      let arrastrando = false;
      let ultimoX = 0;
      let impulso = 0;
      const lienzo = renderer.domElement;
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
          soporte.rotation.y += (velocidad + impulso) * dt;
          impulso *= 0.94;
        }
        if (!reducir.matches) {
          t += dt;
          pieza.position.y = 1.3 + Math.sin(t * 1.4) * 0.06;
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
        geometrias.forEach((g) => g.dispose());
        [acero, aceroOscuro, lineas].forEach((m) => m.dispose());
        escena.environment?.dispose();
        pmrem.dispose();
        renderer.dispose();
        lienzo.remove();
      };
    };

    // Cargar Three.js recién cuando el bloque se acerca a la pantalla.
    const cerca = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        cerca.disconnect();
        iniciar().catch(() => setEstado('sin-webgl'));
      }
    }, { rootMargin: '300px' });
    cerca.observe(el);

    return () => {
      cancelado = true;
      cerca.disconnect();
      limpiar();
    };
  }, []);

  return (
    <div ref={contenedor} className="pieza-3d" data-estado={estado}>
      <Piston className="pieza-3d__respaldo" />
      {estado === 'listo' ? <span className="pieza-3d__ayuda">Arrastrá para girar</span> : null}
    </div>
  );
}
