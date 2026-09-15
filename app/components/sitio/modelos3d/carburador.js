/**
 * Carburador de membrana hecho con geometría propia (Three.js). Se usa en el hero mientras no esté
 * el modelo exportado de Meshy (public/modelos/carburador.glb).
 * Devuelve { grupo, recursos } — recursos son geometrías y materiales para liberar con dispose().
 */
export function construirCarburador(THREE, RoundedBoxGeometry) {
  const recursos = [];
  const guardar = (r) => { recursos.push(r); return r; };
  const material = (color, metalness, roughness, extra = {}) => guardar(new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra }));
  const aluminio = material(0x9aa2ae, 0.9, 0.5);
  const acero = material(0xdfe4ec, 1, 0.25);
  const negro = material(0x15171c, 0.2, 0.55);
  const oscuro = material(0x0b0d12, 0.3, 0.8);
  const bronce = material(0xd1a54a, 1, 0.3);
  const rojo = material(0xd8413a, 0.1, 0.5);
  const cristal = guardar(new THREE.MeshPhysicalMaterial({ color: 0xeef4ff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.38, clearcoat: 1, side: THREE.DoubleSide }));

  const g = new THREE.Group();
  const m = (geo, mat, { pos, rot, padre = g } = {}) => {
    const malla = new THREE.Mesh(guardar(geo), mat);
    if (pos) malla.position.set(...pos);
    if (rot) malla.rotation.set(...rot);
    padre.add(malla);
    return malla;
  };

  // Cuerpo con venturi pasante, brida y surtidor
  m(new RoundedBoxGeometry(2.2, 1.7, 1.5, 4, 0.12), aluminio);
  [1, -1].forEach((lado) => {
    m(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 48), aluminio, { pos: [0, -0.05, lado * 0.8], rot: [Math.PI / 2, 0, 0] });
    m(new THREE.TorusGeometry(0.44, 0.05, 16, 64), negro, { pos: [0, -0.05, lado * 0.865] });
    m(new THREE.CircleGeometry(0.42, 48), oscuro, { pos: [0, -0.05, lado * 0.862], rot: [0, lado === 1 ? 0 : Math.PI, 0] });
  });
  m(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 20), bronce, { pos: [0, -0.05, 0.7], rot: [Math.PI / 2, 0, 0] });
  [[-0.8, 0.55], [0.8, -0.62]].forEach(([x, y]) => {
    m(new THREE.CircleGeometry(0.11, 32), oscuro, { pos: [x, y, 0.752] });
    m(new THREE.TorusGeometry(0.13, 0.025, 10, 32), aluminio, { pos: [x, y, 0.755] });
  });
  // Junta, tapa con tornillos y cebador transparente
  m(new THREE.BoxGeometry(2.14, 0.05, 1.44), negro, { pos: [0, 0.875, 0] });
  m(new RoundedBoxGeometry(2.26, 0.16, 1.56, 2, 0.04), acero, { pos: [0, 0.98, 0] });
  [[-0.92, -0.6], [0.92, -0.6], [-0.92, 0.6], [0.92, 0.6]].forEach(([x, z]) => {
    m(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24), acero, { pos: [x, 1.1, z] });
  });
  m(new THREE.CylinderGeometry(0.5, 0.52, 0.1, 48), acero, { pos: [0, 1.11, 0] });
  m(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 32), rojo, { pos: [0, 1.17, 0] });
  m(new THREE.SphereGeometry(0.46, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), cristal, { pos: [0, 1.16, 0] });
  m(new RoundedBoxGeometry(0.34, 0.42, 0.42, 2, 0.05), negro, { pos: [1.2, 0.72, -0.4] });

  // Tornillos de regulación con perilla
  [[[-1.08, 0.35, 0.38], 0.12], [[-1.08, -0.2, 0.52], -0.05], [[-1.02, -0.72, 0.2], -0.2]].forEach(([pos, giro]) => {
    const t = new THREE.Group();
    m(new THREE.CylinderGeometry(0.055, 0.055, 0.6, 16), acero, { pos: [0, 0.3, 0], padre: t });
    m(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 28), negro, { pos: [0, 0.72, 0], padre: t });
    t.position.set(...pos);
    t.rotation.set(0, 0.25, Math.PI / 2 + giro);
    g.add(t);
  });

  // Pico de combustible de bronce
  const curva = new THREE.QuadraticBezierCurve3(new THREE.Vector3(1.08, -0.15, 0.35), new THREE.Vector3(1.5, -0.15, 0.4), new THREE.Vector3(1.72, -0.42, 0.62));
  m(new THREE.TubeGeometry(curva, 40, 0.065, 16, false), bronce);

  // Palanca del acelerador
  const forma = new THREE.Shape();
  forma.moveTo(-0.1, -0.12);
  forma.lineTo(0.9, -0.2);
  forma.quadraticCurveTo(1.02, -0.2, 1.02, -0.06);
  forma.lineTo(1.0, 0.06);
  forma.lineTo(0.1, 0.14);
  forma.quadraticCurveTo(-0.14, 0.12, -0.1, -0.12);
  m(new THREE.ExtrudeGeometry(forma, { depth: 0.04, bevelEnabled: false, curveSegments: 24 }), acero, { pos: [-0.95, -0.98, 0.72], rot: [0, 0, -0.25] });

  return { grupo: g, recursos };
}
