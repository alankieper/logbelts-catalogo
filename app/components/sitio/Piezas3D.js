'use client';

import { useEffect, useRef, useState } from 'react';
import { Carburador } from './LineasRepuestos';
import { Flecha } from './Iconos';

export const PIEZAS_3D = [
  { id: 'carburador', nombre: 'Carburador', href: '/f/carburacion', ver: 'Ver carburación' },
  { id: 'desmalezadora', nombre: 'Desmalezadora', href: '/f/desmalezadoras', ver: 'Repuestos de desmalezadoras' },
  { id: 'motosierra', nombre: 'Motosierra', href: '/f/motosierras', ver: 'Repuestos de motosierras' },
];

/**
 * Visor 3D (Three.js) con tres modelos hechos con geometría propia: carburador de membrana,
 * desmalezadora azul y motosierra, las dos con el logo Logbelts. Gira solo y se puede arrastrar.
 * Three.js se carga recién cuando el visor está cerca de la pantalla; sin WebGL queda el dibujo de línea.
 */
export default function Piezas3D() {
  const contenedor = useRef(null);
  const api = useRef(null);
  const [actual, setActual] = useState(0);
  const actualRef = useRef(0);
  const [estado, setEstado] = useState('cargando'); // cargando | listo | sin-webgl

  useEffect(() => {
    actualRef.current = actual;
    api.current?.mostrar(actual);
  }, [actual]);

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
      const V = THREE.Vector3;

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
      camara.position.set(0, 0.6, 9);
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
      const estandar = (color, metalness, roughness, extra = {}) => guardar(new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra }));
      const plastico = (color) => guardar(new THREE.MeshPhysicalMaterial({ color, metalness: 0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }));

      const aluminio = estandar(0x8f97a4, 0.9, 0.55);
      const acero = estandar(0xdfe4ec, 1, 0.25);
      const aceroOscuro = estandar(0x5a5f68, 0.9, 0.35);
      const negro = estandar(0x15171c, 0.2, 0.55);
      const negroMate = estandar(0x1b1d22, 0.1, 0.75);
      const oscuro = estandar(0x0b0d12, 0.3, 0.8);
      const bronce = estandar(0xd1a54a, 1, 0.3);
      const rojo = estandar(0xd8413a, 0.1, 0.5);
      const amarillo = estandar(0xf2c230, 0, 0.5);
      const grisPlastico = estandar(0x4a4f57, 0, 0.6);
      const cristal = guardar(new THREE.MeshPhysicalMaterial({ color: 0xeef4ff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.38, clearcoat: 1, side: THREE.DoubleSide }));
      const tanque = guardar(new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, metalness: 0, roughness: 0.3, transparent: true, opacity: 0.88 }));
      const azul = plastico(0x1f63e0);
      const azulOscuro = plastico(0x173f95);
      const azulMoto = plastico(0x3a44a6);
      const grisMoto = plastico(0x646c66);
      const lineas = guardar(new THREE.LineBasicMaterial({ color: 0x8fb0ff, transparent: true, opacity: 0.22 }));

      const logoTex = guardar(new THREE.TextureLoader().load('/logo-blanco.png'));
      logoTex.colorSpace = THREE.SRGBColorSpace;
      logoTex.anisotropy = 8;
      const logoMat = guardar(new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 }));

      const malla = (geo, mat, { pos, rot, bordes = false, padre } = {}) => {
        guardar(geo);
        const m = new THREE.Mesh(geo, mat);
        if (pos) m.position.set(...pos);
        if (rot) m.rotation.set(...rot);
        if (bordes) m.add(new THREE.LineSegments(guardar(new THREE.EdgesGeometry(geo, 35)), lineas));
        padre.add(m);
        return m;
      };
      // Logo Logbelts pegado sobre una cara (el PNG es 1254 × 620)
      const calco = (padre, ancho, pos, rotY = 0) => {
        const m = new THREE.Mesh(guardar(new THREE.PlaneGeometry(ancho, (ancho * 620) / 1254)), logoMat);
        m.position.set(...pos);
        m.rotation.y = rotY;
        padre.add(m);
      };

      /* ---------- Carburador ---------- */
      const carburador = () => {
        const g = new THREE.Group();
        const m = (geo, mat, o = {}) => malla(geo, mat, { bordes: true, padre: g, ...o });
        m(new RoundedBoxGeometry(2.2, 1.7, 1.5, 4, 0.12), aluminio);
        [1, -1].forEach((lado) => {
          m(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 48), aluminio, { pos: [0, -0.05, lado * 0.8], rot: [Math.PI / 2, 0, 0] });
          m(new THREE.TorusGeometry(0.44, 0.05, 16, 64), aluminio, { pos: [0, -0.05, lado * 0.865] });
          m(new THREE.CircleGeometry(0.42, 48), oscuro, { pos: [0, -0.05, lado * 0.862], rot: [0, lado === 1 ? 0 : Math.PI, 0], bordes: false });
        });
        m(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 20), bronce, { pos: [0, -0.05, 0.7], rot: [Math.PI / 2, 0, 0] });
        [-0.35, 0, 0.35].forEach((z) => m(new THREE.BoxGeometry(0.06, 1.2, 0.08), aluminio, { pos: [1.13, -0.1, z], bordes: false }));
        [[-0.8, 0.55], [0.8, -0.62]].forEach(([x, y]) => {
          m(new THREE.CircleGeometry(0.11, 32), oscuro, { pos: [x, y, 0.752], bordes: false });
          m(new THREE.TorusGeometry(0.13, 0.025, 10, 32), aluminio, { pos: [x, y, 0.755], bordes: false });
        });
        m(new THREE.BoxGeometry(2.14, 0.05, 1.44), negro, { pos: [0, 0.875, 0], bordes: false });
        m(new RoundedBoxGeometry(2.26, 0.16, 1.56, 2, 0.04), acero, { pos: [0, 0.98, 0] });
        [[-0.92, -0.6], [0.92, -0.6], [-0.92, 0.6], [0.92, 0.6]].forEach(([x, z]) => {
          m(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24), acero, { pos: [x, 1.1, z] });
          m(new THREE.BoxGeometry(0.16, 0.02, 0.03), oscuro, { pos: [x, 1.145, z], bordes: false });
        });
        m(new THREE.CylinderGeometry(0.5, 0.52, 0.1, 48), acero, { pos: [0, 1.11, 0] });
        m(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32), rojo, { pos: [0, 1.17, 0], bordes: false });
        m(new THREE.SphereGeometry(0.46, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), cristal, { pos: [0, 1.16, 0], bordes: false });
        m(new RoundedBoxGeometry(0.34, 0.42, 0.42, 2, 0.05), negro, { pos: [1.2, 0.72, -0.4] });

        const helice = new THREE.Curve();
        helice.getPoint = (t, destino = new V()) => destino.set(Math.cos(t * Math.PI * 14) * 0.12, t * 0.42, Math.sin(t * Math.PI * 14) * 0.12);
        const tornillo = (pos, rot) => {
          const t = new THREE.Group();
          malla(new THREE.CylinderGeometry(0.055, 0.055, 0.6, 16), acero, { pos: [0, 0.3, 0], padre: t });
          malla(new THREE.TubeGeometry(helice, 160, 0.018, 8, false), acero, { pos: [0, 0.02, 0], padre: t });
          malla(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 28), negro, { pos: [0, 0.72, 0], padre: t, bordes: true });
          malla(new THREE.CylinderGeometry(0.12, 0.16, 0.1, 28), negro, { pos: [0, 1.0, 0], padre: t, bordes: true });
          t.position.set(...pos);
          t.rotation.set(...rot);
          g.add(t);
        };
        tornillo([-1.08, 0.35, 0.38], [0, 0.25, Math.PI / 2 + 0.12]);
        tornillo([-1.08, -0.2, 0.52], [0, 0.4, Math.PI / 2 - 0.05]);
        tornillo([-1.02, -0.72, 0.2], [0, 0.15, Math.PI / 2 - 0.2]);

        const curvaPico = new THREE.QuadraticBezierCurve3(new V(1.08, -0.15, 0.35), new V(1.5, -0.15, 0.4), new V(1.72, -0.42, 0.62));
        m(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 6), bronce, { pos: [1.12, -0.15, 0.35], rot: [0, 0, Math.PI / 2] });
        m(new THREE.TubeGeometry(curvaPico, 40, 0.065, 16, false), bronce, { bordes: false });
        m(new THREE.TorusGeometry(0.08, 0.02, 8, 24), bronce, { pos: [1.62, -0.33, 0.54], rot: [0.5, 0.9, 0], bordes: false });

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
        m(new THREE.ExtrudeGeometry(forma, { depth: 0.04, bevelEnabled: false, curveSegments: 24 }), acero, { pos: [-0.95, -0.98, 0.72], rot: [0, 0, -0.25] });
        m(new THREE.TorusGeometry(0.1, 0.025, 10, 28), acero, { pos: [-0.95, -0.9, 0.78], bordes: false });
        return g;
      };

      /* ---------- Desmalezadora azul ---------- */
      const desmalezadora = () => {
        const g = new THREE.Group();
        const m = (geo, mat, o = {}) => malla(geo, mat, { padre: g, ...o });

        // Barra (tubo de transmisión)
        m(new THREE.CylinderGeometry(0.075, 0.075, 5.4, 24), negroMate, { pos: [0.55, 0, 0], rot: [0, 0, Math.PI / 2] });
        // Motor: campana de embrague, carcasa, cilindro con aletas, arranque, tanque y filtro
        m(new THREE.CylinderGeometry(0.34, 0.18, 0.5, 32), azul, { pos: [-2.2, 0, 0], rot: [0, 0, Math.PI / 2] });
        m(new RoundedBoxGeometry(1.05, 0.9, 0.95, 4, 0.16), azul, { pos: [-2.95, 0.08, 0] });
        for (let i = 0; i < 5; i++) m(new THREE.BoxGeometry(0.06, 0.3, 0.62), aluminio, { pos: [-3.23 + i * 0.13, 0.62, 0] });
        m(new RoundedBoxGeometry(0.78, 0.2, 0.72, 2, 0.08), azulOscuro, { pos: [-2.95, 0.84, 0] });
        m(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 16), negro, { pos: [-3.45, 0.72, 0.12], rot: [0, 0, 0.9] });
        m(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 40), grisPlastico, { pos: [-3.55, 0.05, 0], rot: [0, 0, Math.PI / 2] });
        m(new THREE.TorusGeometry(0.28, 0.03, 10, 40), negro, { pos: [-3.63, 0.05, 0], rot: [0, Math.PI / 2, 0] });
        m(new RoundedBoxGeometry(0.1, 0.12, 0.38, 2, 0.04), negro, { pos: [-3.68, 0.05, 0] });
        m(new RoundedBoxGeometry(0.85, 0.42, 0.8, 3, 0.14), tanque, { pos: [-2.95, -0.55, 0] });
        m(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 20), negro, { pos: [-3.2, -0.55, 0.42], rot: [Math.PI / 2, 0, 0] });
        m(new RoundedBoxGeometry(0.45, 0.55, 0.22, 3, 0.08), azulOscuro, { pos: [-3.32, 0.12, 0.54] });
        m(new THREE.PlaneGeometry(0.3, 0.2), amarillo, { pos: [-2.62, 0.26, -0.478], rot: [0, Math.PI, 0] });
        calco(g, 0.62, [-2.75, -0.05, 0.477]);
        calco(g, 0.62, [-2.95, -0.1, -0.477], Math.PI);

        // Manubrio tipo bicicleta con puños y acelerador
        const mx = -0.5;
        m(new RoundedBoxGeometry(0.3, 0.26, 0.26, 2, 0.05), negro, { pos: [mx, 0, 0] });
        m(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 12), acero, { pos: [mx, 0.12, 0] });
        const manubrio = new THREE.CatmullRomCurve3([
          new V(mx - 0.35, 1.15, -1.15), new V(mx - 0.15, 0.6, -0.85), new V(mx, 0.24, -0.3),
          new V(mx, 0.24, 0.3), new V(mx - 0.15, 0.6, 0.85), new V(mx - 0.35, 1.15, 1.15),
        ]);
        m(new THREE.TubeGeometry(manubrio, 80, 0.045, 12, false), acero);
        [-1, 1].forEach((lado) => {
          const a = new V(mx - 0.35, 1.15, lado * 1.15);
          const b = a.clone().add(new V(-0.35, 0.45, lado * 0.45).normalize().multiplyScalar(0.5));
          m(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 4, 0.075, 16, false), negro);
        });
        m(new RoundedBoxGeometry(0.2, 0.12, 0.12, 2, 0.04), azul, { pos: [mx - 0.47, 1.2, 1.36] });

        // Cabezal de engranajes, cabezal de tanza y protector
        m(new THREE.SphereGeometry(0.16, 24, 16), aluminio, { pos: [3.3, 0, 0] });
        m(new THREE.CylinderGeometry(0.12, 0.1, 0.42, 20), aluminio, { pos: [3.39, -0.18, 0], rot: [0, 0, 0.466] });
        const cabeza = new THREE.Group();
        cabeza.position.set(3.53, -0.46, 0);
        cabeza.rotation.z = 0.466;
        g.add(cabeza);
        const c = (geo, mat, o = {}) => malla(geo, mat, { padre: cabeza, ...o });
        c(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 40), negro, { pos: [0, -0.06, 0] });
        c(new THREE.TorusGeometry(0.3, 0.035, 12, 40), azul, { pos: [0, -0.06, 0], rot: [Math.PI / 2, 0, 0] });
        c(new THREE.BoxGeometry(1.2, 0.015, 0.015), estandar(0xe6e8ec, 0, 0.6), { pos: [0, -0.06, 0] });
        const protector = guardar(new THREE.MeshPhysicalMaterial({ color: 0x1f63e0, roughness: 0.4, clearcoat: 0.4, side: THREE.DoubleSide }));
        c(new THREE.CylinderGeometry(0.74, 0.74, 0.24, 48, 1, true, Math.PI, Math.PI), protector, { pos: [0, 0.12, 0] });
        c(new THREE.CircleGeometry(0.74, 48, Math.PI / 2, Math.PI), protector, { pos: [0, 0.24, 0], rot: [-Math.PI / 2, 0, 0] });

        g.rotation.z = -0.28;
        return g;
      };

      /* ---------- Motosierra ---------- */
      const motosierra = () => {
        const g = new THREE.Group();
        const m = (geo, mat, o = {}) => malla(geo, mat, { padre: g, ...o });

        // Cuerpo y tapa superior
        m(new RoundedBoxGeometry(2.1, 1.05, 0.95, 4, 0.2), azulMoto);
        m(new RoundedBoxGeometry(1.35, 0.34, 0.82, 3, 0.14), grisMoto, { pos: [0.15, 0.62, 0] });
        m(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20), negro, { pos: [-0.62, 0.55, 0.28] });
        // Arranque con rejilla (lado izquierdo)
        m(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 40), grisMoto, { pos: [-0.35, -0.02, -0.52], rot: [Math.PI / 2, 0, 0] });
        for (let i = 0; i < 5; i++) m(new THREE.BoxGeometry(0.5, 0.035, 0.02), negro, { pos: [-0.35, -0.22 + i * 0.1, -0.58] });
        m(new RoundedBoxGeometry(0.36, 0.1, 0.12, 2, 0.04), negro, { pos: [-0.35, 0.5, -0.58] });
        // Manija trasera con gatillo
        const trasera = new THREE.CatmullRomCurve3([new V(-0.85, 0.42, 0), new V(-1.55, 0.5, 0), new V(-2.0, 0.15, 0), new V(-1.95, -0.35, 0), new V(-0.98, -0.45, 0)]);
        m(new THREE.TubeGeometry(trasera, 80, 0.13, 16, false), negro);
        m(new RoundedBoxGeometry(0.3, 0.1, 0.12, 2, 0.04), grisMoto, { pos: [-1.4, 0.34, 0] });
        // Manija delantera (arco) y protector de mano
        const delantera = new THREE.CatmullRomCurve3([new V(0.55, -0.45, -0.5), new V(0.62, 0.35, -0.62), new V(0.5, 1.0, -0.3), new V(0.3, 1.08, 0.15), new V(0.1, 0.8, 0.5)]);
        m(new THREE.TubeGeometry(delantera, 80, 0.09, 14, false), negro);
        m(new RoundedBoxGeometry(0.07, 0.75, 0.95, 2, 0.03), negro, { pos: [1.02, 0.62, 0], rot: [0, 0, -0.35] });
        calco(g, 0.9, [-0.3, -0.12, 0.478]);

        // Espada con franja azul y logo
        const L0 = 0.7, L1 = 4.3, hb = 0.28, ht = 0.19;
        const forma = new THREE.Shape();
        forma.moveTo(L0, -hb);
        forma.lineTo(L1, -ht);
        forma.absarc(L1, 0, ht, -Math.PI / 2, Math.PI / 2, false);
        forma.lineTo(L0, hb);
        forma.lineTo(L0, -hb);
        m(new THREE.ExtrudeGeometry(forma, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1, curveSegments: 24 }), acero, { pos: [0, -0.12, 0.5] });
        m(new THREE.PlaneGeometry(2.2, 0.24), azulMoto, { pos: [2.65, -0.12, 0.563] });
        calco(g, 0.46, [2.05, -0.12, 0.566]);

        // Cadena: eslabón continuo alrededor de la espada + dientes
        const e = 0.035;
        const puntos = [];
        for (let i = 0; i <= 20; i++) { const t = i / 20; puntos.push(new V(L0 + (L1 - L0) * t, -(hb + (ht - hb) * t + e), 0)); }
        for (let i = 1; i < 20; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 20; puntos.push(new V(L1 + Math.cos(a) * (ht + e), Math.sin(a) * (ht + e), 0)); }
        for (let i = 20; i >= 0; i--) { const t = i / 20; puntos.push(new V(L0 + (L1 - L0) * t, hb + (ht - hb) * t + e, 0)); }
        for (let i = 1; i < 20; i++) { const a = Math.PI / 2 + (Math.PI * i) / 20; puntos.push(new V(L0 + Math.cos(a) * (hb + e), Math.sin(a) * (hb + e), 0)); }
        const cadena = new THREE.CatmullRomCurve3(puntos, true);
        m(new THREE.TubeGeometry(cadena, 300, 0.028, 8, true), aceroOscuro, { pos: [0, -0.12, 0.525] });
        const n = 72;
        const dientes = guardar(new THREE.InstancedMesh(guardar(new THREE.BoxGeometry(0.075, 0.05, 0.075)), aceroOscuro, n));
        const matriz = new THREE.Matrix4();
        const giro = new THREE.Quaternion();
        const uno = new V(1, 1, 1);
        for (let i = 0; i < n; i++) {
          giro.setFromUnitVectors(new V(1, 0, 0), cadena.getTangentAt(i / n));
          dientes.setMatrixAt(i, matriz.compose(cadena.getPointAt(i / n), giro, uno));
        }
        dientes.position.set(0, -0.12, 0.525);
        g.add(dientes);
        // Tapa del piñón con tuercas
        m(new RoundedBoxGeometry(0.9, 0.7, 0.16, 3, 0.06), negro, { pos: [0.85, -0.12, 0.62] });
        [0.02, -0.26].forEach((y) => m(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), aluminio, { pos: [1.0, y, 0.72], rot: [Math.PI / 2, 0, 0] }));
        return g;
      };

      // Cada modelo se centra y se escala para ocupar lo mismo en pantalla
      const encuadrar = (grupo, tam) => {
        const caja = new THREE.Box3().setFromObject(grupo);
        const medida = caja.getSize(new V());
        grupo.position.sub(caja.getCenter(new V()));
        const envoltorio = new THREE.Group();
        envoltorio.add(grupo);
        envoltorio.userData.escala = tam / Math.max(medida.x, medida.y, medida.z);
        envoltorio.scale.setScalar(envoltorio.userData.escala);
        return envoltorio;
      };
      const modelos = [
        { grupo: encuadrar(carburador(), 3.3), inclinacion: 0.32, exposicion: 0.8 },
        { grupo: encuadrar(desmalezadora(), 4.2), inclinacion: 0.2, exposicion: 1 },
        { grupo: encuadrar(motosierra(), 4.1), inclinacion: 0.22, exposicion: 1 },
      ];

      const pieza = new THREE.Group();
      modelos.forEach(({ grupo }) => pieza.add(grupo));
      const soporte = new THREE.Group();
      soporte.add(pieza);
      escena.add(soporte);

      let entrada = 1;
      const mostrar = (i) => {
        modelos.forEach(({ grupo }, j) => { grupo.visible = j === i; });
        soporte.rotation.x = modelos[i].inclinacion;
        renderer.toneMappingExposure = modelos[i].exposicion;
        entrada = 0;
      };
      mostrar(actualRef.current);

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
      const bajar = (ev) => { arrastrando = true; ultimoX = ev.clientX; lienzo.setPointerCapture(ev.pointerId); lienzo.style.cursor = 'grabbing'; };
      const mover = (ev) => {
        if (!arrastrando) return;
        const dx = ev.clientX - ultimoX;
        ultimoX = ev.clientX;
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
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
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
        if (entrada < 1) {
          entrada = reducir.matches ? 1 : Math.min(1, entrada + dt * 2.5);
          const suave = 1 - (1 - entrada) ** 3;
          modelos.forEach(({ grupo }) => grupo.scale.setScalar(grupo.userData.escala * (0.8 + 0.2 * suave)));
        }
        if (!reducir.matches) {
          t += dt;
          pieza.position.y = Math.sin(t * 1.3) * 0.06;
        }
        renderer.render(escena, camara);
      });
      api.current = { mostrar };
      setEstado('listo');

      limpiar = () => {
        api.current = null;
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

    const cerca = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) {
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

  const pieza = PIEZAS_3D[actual];

  return (
    <div className="visor-3d">
      <div ref={contenedor} className="pieza-3d" data-estado={estado} role="img" aria-label={`${pieza.nombre} en 3D`}>
        <Carburador className="pieza-3d__respaldo" />
      </div>
      <div className="visor-3d__tabs" role="group" aria-label="Elegí qué ver en 3D">
        {PIEZAS_3D.map((p, i) => (
          <button key={p.id} type="button" aria-pressed={i === actual} onClick={() => setActual(i)}>
            {p.nombre}
          </button>
        ))}
      </div>
      <p className="visor-3d__pie">
        <span>{estado === 'listo' ? 'Arrastrá para girar' : ' '}</span>
        <a href={pieza.href}>{pieza.ver} <Flecha /></a>
      </p>
    </div>
  );
}
