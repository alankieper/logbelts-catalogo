'use client';

import { useEffect, useRef, useState } from 'react';
import { Carburador } from './LineasRepuestos';

/**
 * Carburador de membrana en 3D (Three.js), modelado con geometría propia: cuerpo de aluminio,
 * cebador transparente con tapa atornillada, tornillos de regulación con resorte, pico de
 * combustible de bronce y palanca de acelerador. Gira solo y se puede arrastrar.
 * Three.js se carga recién cuando el bloque está cerca de la pantalla; sin WebGL queda el dibujo de línea.
 */
export default function Carburador3D() {
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
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
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

      const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camara.position.set(0, 0.6, 8.2);
      camara.lookAt(0, 0, 0);

      escena.add(new THREE.AmbientLight(0x8fb0ff, 0.3));
      const clave = new THREE.DirectionalLight(0xffffff, 2.4);
      clave.position.set(4, 6, 6);
      escena.add(clave);
      const contra = new THREE.DirectionalLight(0x5b8cff, 2.6);
      contra.position.set(-5, -1, -4);
      escena.add(contra);

      const recursos = [];
      const guardar = (r) => { recursos.push(r); return r; };
      renderer.toneMappingExposure = 0.8;
      const aluminio = guardar(new THREE.MeshStandardMaterial({ color: 0x8f97a4, metalness: 0.9, roughness: 0.55 }));
      const acero = guardar(new THREE.MeshStandardMaterial({ color: 0xdfe4ec, metalness: 1, roughness: 0.25 }));
      const negro = guardar(new THREE.MeshStandardMaterial({ color: 0x15171c, metalness: 0.2, roughness: 0.55 }));
      const oscuro = guardar(new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.3, roughness: 0.8 }));
      const bronce = guardar(new THREE.MeshStandardMaterial({ color: 0xd1a54a, metalness: 1, roughness: 0.3 }));
      const rojo = guardar(new THREE.MeshStandardMaterial({ color: 0xd8413a, metalness: 0.1, roughness: 0.5 }));
      const cristal = guardar(new THREE.MeshPhysicalMaterial({ color: 0xeef4ff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.38, clearcoat: 1, side: THREE.DoubleSide }));
      const lineas = guardar(new THREE.LineBasicMaterial({ color: 0x8fb0ff, transparent: true, opacity: 0.22 }));

      const pieza = new THREE.Group();
      const malla = (geo, mat, { pos, rot, bordes = true, padre = pieza } = {}) => {
        guardar(geo);
        const m = new THREE.Mesh(geo, mat);
        if (pos) m.position.set(...pos);
        if (rot) m.rotation.set(...rot);
        if (bordes) {
          const b = new THREE.LineSegments(guardar(new THREE.EdgesGeometry(geo, 35)), lineas);
          m.add(b);
        }
        padre.add(m);
        return m;
      };

      // Cuerpo
      malla(new RoundedBoxGeometry(2.2, 1.7, 1.5, 4, 0.12), aluminio);
      // Boca del venturi (frente y atrás, atraviesa el cuerpo) con brida y surtidor
      [1, -1].forEach((lado) => {
        malla(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 48), aluminio, { pos: [0, -0.05, lado * 0.8], rot: [Math.PI / 2, 0, 0] });
        malla(new THREE.TorusGeometry(0.44, 0.05, 16, 64), aluminio, { pos: [0, -0.05, lado * 0.865] });
        malla(new THREE.CircleGeometry(0.42, 48), oscuro, { pos: [0, -0.05, lado * 0.862], rot: [0, lado === 1 ? 0 : Math.PI, 0], bordes: false });
      });
      malla(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 20), bronce, { pos: [0, -0.05, 0.7], rot: [Math.PI / 2, 0, 0] });
      // Aletas de fundición laterales
      [-0.35, 0, 0.35].forEach((z) => {
        malla(new THREE.BoxGeometry(0.06, 1.2, 0.08), aluminio, { pos: [1.13, -0.1, z], bordes: false });
      });
      // Agujeros de montaje
      [[-0.8, 0.55], [0.8, -0.62]].forEach(([x, y]) => {
        malla(new THREE.CircleGeometry(0.11, 32), oscuro, { pos: [x, y, 0.752], bordes: false });
        malla(new THREE.TorusGeometry(0.13, 0.025, 10, 32), aluminio, { pos: [x, y, 0.755], bordes: false });
      });
      // Junta y tapa superior con 4 tornillos
      malla(new THREE.BoxGeometry(2.14, 0.05, 1.44), negro, { pos: [0, 0.875, 0], bordes: false });
      malla(new RoundedBoxGeometry(2.26, 0.16, 1.56, 2, 0.04), acero, { pos: [0, 0.98, 0] });
      [[-0.92, -0.6], [0.92, -0.6], [-0.92, 0.6], [0.92, 0.6]].forEach(([x, z]) => {
        malla(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24), acero, { pos: [x, 1.1, z] });
        malla(new THREE.BoxGeometry(0.16, 0.02, 0.03), oscuro, { pos: [x, 1.145, z], bordes: false });
      });
      // Cebador: aro, membrana roja y cúpula transparente
      malla(new THREE.CylinderGeometry(0.5, 0.52, 0.1, 48), acero, { pos: [0, 1.11, 0] });
      malla(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32), rojo, { pos: [0, 1.17, 0], bordes: false });
      malla(new THREE.SphereGeometry(0.46, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), cristal, { pos: [0, 1.16, 0], bordes: false });
      // Conector negro lateral superior
      malla(new RoundedBoxGeometry(0.34, 0.42, 0.42, 2, 0.05), negro, { pos: [1.2, 0.72, -0.4] });

      // Tornillos de regulación con resorte y perilla negra (lado izquierdo)
      const helice = new THREE.Curve();
      helice.getPoint = (t, destino = new THREE.Vector3()) => destino.set(Math.cos(t * Math.PI * 14) * 0.12, t * 0.42, Math.sin(t * Math.PI * 14) * 0.12);
      const tornillo = (pos, rot) => {
        const g = new THREE.Group();
        malla(new THREE.CylinderGeometry(0.055, 0.055, 0.6, 16), acero, { pos: [0, 0.3, 0], padre: g, bordes: false });
        malla(new THREE.TubeGeometry(helice, 160, 0.018, 8, false), acero, { pos: [0, 0.02, 0], padre: g, bordes: false });
        malla(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 28), negro, { pos: [0, 0.72, 0], padre: g });
        malla(new THREE.CylinderGeometry(0.12, 0.16, 0.1, 28), negro, { pos: [0, 1.0, 0], padre: g });
        g.position.set(...pos);
        g.rotation.set(...rot);
        pieza.add(g);
      };
      tornillo([-1.08, 0.35, 0.38], [0, 0.25, Math.PI / 2 + 0.12]);
      tornillo([-1.08, -0.2, 0.52], [0, 0.4, Math.PI / 2 - 0.05]);
      tornillo([-1.02, -0.72, 0.2], [0, 0.15, Math.PI / 2 - 0.2]);

      // Pico de combustible de bronce (lado derecho)
      const curvaPico = new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.08, -0.15, 0.35), new THREE.Vector3(1.5, -0.15, 0.4), new THREE.Vector3(1.72, -0.42, 0.62));
      malla(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 6), bronce, { pos: [1.12, -0.15, 0.35], rot: [0, 0, Math.PI / 2] });
      malla(new THREE.TubeGeometry(curvaPico, 40, 0.065, 16, false), bronce, { bordes: false });
      malla(new THREE.TorusGeometry(0.08, 0.02, 8, 24), bronce, { pos: [1.62, -0.33, 0.54], rot: [0.5, 0.9, 0], bordes: false });

      // Palanca del acelerador (abajo al frente)
      const forma = new THREE.Shape();
      forma.moveTo(-0.1, -0.12);
      forma.lineTo(0.9, -0.2);
      forma.quadraticCurveTo(1.02, -0.2, 1.02, -0.06);
      forma.lineTo(1.0, 0.06);
      forma.lineTo(0.1, 0.14);
      forma.quadraticCurveTo(-0.14, 0.12, -0.1, -0.12);
      const agujero = new THREE.Path();
      agujero.absarc(0.86, -0.07, 0.05, 0, Math.PI * 2, true);
      forma.holes.push(agujero);
      const palanca = new THREE.ExtrudeGeometry(forma, { depth: 0.04, bevelEnabled: false, curveSegments: 24 });
      malla(palanca, acero, { pos: [-0.95, -0.98, 0.72], rot: [0, 0, -0.25] });
      malla(new THREE.TorusGeometry(0.1, 0.025, 10, 28), acero, { pos: [-0.95, -0.9, 0.78], bordes: false });

      const soporte = new THREE.Group();
      soporte.add(pieza);
      soporte.rotation.x = 0.32;
      escena.add(soporte);

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
      const velocidad = reducir.matches ? 0 : 0.4;
      soporte.rotation.y = -0.6;
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
          pieza.position.y = Math.sin(t * 1.3) * 0.06;
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
        recursos.forEach((r) => r.dispose());
        escena.environment?.dispose();
        pmrem.dispose();
        renderer.dispose();
        lienzo.remove();
      };
    };

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
      <Carburador className="pieza-3d__respaldo" />
      {estado === 'listo' ? <span className="pieza-3d__ayuda">Arrastrá para girar</span> : null}
    </div>
  );
}
