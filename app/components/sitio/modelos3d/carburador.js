/**
 * Carburador de membrana hecho con geometría propia (Three.js), con el acabado del modelo de Meshy:
 * aluminio fundido con poro y rayones, tapa negra con placa y 4 tornillos, bulbo cebador translúcido,
 * mariposa de latón, codo y bucle de latón, tornillos de regulación con resorte y capuchón de goma.
 * Se usa en el visor de piezas y en el hero (mientras no esté public/modelos/carburador.glb).
 * Las mallas proyectan y reciben sombra: activar renderer.shadowMap y castShadow en la luz principal.
 * Devuelve { grupo, recursos } — recursos son geometrías, materiales y texturas para liberar con dispose().
 */
export function construirCarburador(THREE, RoundedBoxGeometry, { anisotropia = 1 } = {}) {
  const V = THREE.Vector3;
  const recursos = [];
  const guardar = (r) => { recursos.push(r); return r; };
  const estandar = (color, metalness, roughness, extra = {}) => guardar(new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra }));

  // Textura en escala de grises dibujada en un canvas (para color, rugosidad y relieve)
  const textura = (ancho, alto, pintar) => {
    const lienzo = document.createElement('canvas');
    lienzo.width = ancho;
    lienzo.height = alto;
    pintar(lienzo.getContext('2d'), ancho, alto);
    const t = guardar(new THREE.CanvasTexture(lienzo));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = anisotropia;
    return t;
  };

  const g = new THREE.Group();
  const m = (geo, mat, { pos, rot, esc, padre = g } = {}) => {
    const malla = new THREE.Mesh(guardar(geo), mat);
    if (pos) malla.position.set(...pos);
    if (rot) malla.rotation.set(...rot);
    if (esc) malla.scale.set(...esc);
    padre.add(malla);
    return malla;
  };

  // Aluminio fundido: poro, manchas del molde, rayones claros y picaduras
  const poro = textura(1024, 1024, (ctx, w, h) => {
    const datos = ctx.createImageData(w, h);
    for (let i = 0; i < datos.data.length; i += 4) {
      datos.data[i] = datos.data[i + 1] = datos.data[i + 2] = 165 + (Math.random() - 0.5) * 70;
      datos.data[i + 3] = 255;
    }
    ctx.putImageData(datos, 0, 0);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, radio = 20 + Math.random() * 90;
      const tono = Math.random() < 0.6 ? '40,40,40' : '255,255,255';
      const mancha = ctx.createRadialGradient(x, y, 0, x, y, radio);
      mancha.addColorStop(0, `rgba(${tono},${0.05 + Math.random() * 0.08})`);
      mancha.addColorStop(1, `rgba(${tono},0)`);
      ctx.fillStyle = mancha;
      ctx.fillRect(x - radio, y - radio, radio * 2, radio * 2);
    }
    ctx.lineCap = 'round';
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, a = Math.random() * Math.PI, l = 8 + Math.random() * 42;
      ctx.strokeStyle = `rgba(250,250,250,${0.2 + Math.random() * 0.4})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
    for (let i = 0; i < 320; i++) {
      ctx.fillStyle = `rgba(50,50,50,${0.3 + Math.random() * 0.45})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 0.8 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  // Piel de naranja fina del plástico y del zincado
  const piel = textura(256, 256, (ctx, w, h) => {
    const datos = ctx.createImageData(w, h);
    for (let i = 0; i < datos.data.length; i += 4) {
      datos.data[i] = datos.data[i + 1] = datos.data[i + 2] = 190 + (Math.random() - 0.5) * 90;
      datos.data[i + 3] = 255;
    }
    ctx.putImageData(datos, 0, 0);
  });

  const fundicion = guardar(new THREE.MeshPhysicalMaterial({
    color: 0xa2a5ab, metalness: 0.85, roughness: 0.55, map: poro, roughnessMap: poro, bumpMap: poro, bumpScale: 2.5, envMapIntensity: 1.25,
  }));
  const fundicionOscura = estandar(0x55585e, 0.6, 0.5, { map: poro, roughnessMap: poro, bumpMap: poro, bumpScale: 1.5 });
  const maquinado = estandar(0xc4c7cc, 0.95, 0.3, { roughnessMap: poro, bumpMap: poro, bumpScale: 0.6 });
  const paredVenturi = estandar(0x3c3f44, 0.7, 0.55, { side: THREE.BackSide });
  const tapaNegra = guardar(new THREE.MeshPhysicalMaterial({
    color: 0x17181b, roughness: 0.5, roughnessMap: piel, bumpMap: piel, bumpScale: 0.8, clearcoat: 0.25, clearcoatRoughness: 0.45,
  }));
  const goma = guardar(new THREE.MeshPhysicalMaterial({
    color: 0x131416, roughness: 0.68, sheen: 0.5, sheenRoughness: 0.7, sheenColor: 0x5a606a, side: THREE.DoubleSide,
  }));
  const junta = estandar(0x1a1b1e, 0, 0.8);
  const placa = estandar(0xcfd3d8, 1, 0.24, { roughnessMap: piel });
  const aceroOscuro = estandar(0x5a5f68, 0.9, 0.35);
  const oscuro = estandar(0x0b0d12, 0.3, 0.8);
  const laton = guardar(new THREE.MeshPhysicalMaterial({ color: 0xd19b4d, metalness: 1, roughness: 0.24, roughnessMap: poro, clearcoat: 0.2 }));
  // Bulbo cebador: plástico lechoso translúcido (deja pasar la luz)
  const bulbo = guardar(new THREE.MeshPhysicalMaterial({
    color: 0xf6f6f4, metalness: 0, roughness: 0.3, transmission: 0.92, thickness: 0.35, ior: 1.46,
    attenuationColor: 0xe6ddd0, attenuationDistance: 1.2, clearcoat: 0.6, clearcoatRoughness: 0.2,
  }));

  // Cuerpo con el venturi y los dos agujeros de montaje pasantes
  const cuerpo = new THREE.Shape();
  const [a, b, r] = [1.0, 0.67, 0.12];
  cuerpo.moveTo(-a + r, -b);
  cuerpo.lineTo(a - r, -b);
  cuerpo.quadraticCurveTo(a, -b, a, -b + r);
  cuerpo.lineTo(a, b - r);
  cuerpo.quadraticCurveTo(a, b, a - r, b);
  cuerpo.lineTo(-a + r, b);
  cuerpo.quadraticCurveTo(-a, b, -a, b - r);
  cuerpo.lineTo(-a, -b + r);
  cuerpo.quadraticCurveTo(-a, -b, -a + r, -b);
  [[0, 0.02, 0.44], [-0.72, 0.05, 0.2], [0.72, 0.05, 0.2]].forEach(([x, y, radio]) => {
    const hueco = new THREE.Path();
    hueco.absarc(x, y, radio, 0, Math.PI * 2, true);
    cuerpo.holes.push(hueco);
  });
  m(new THREE.ExtrudeGeometry(cuerpo, { depth: 1.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 48 }), fundicion, { pos: [0, 0, -0.67] });
  m(new THREE.CylinderGeometry(0.355, 0.355, 1.5, 48, 1, true), paredVenturi, { pos: [0, 0.02, 0], rot: [Math.PI / 2, 0, 0] });

  [1, -1].forEach((lado) => {
    // Mariposa de latón con tornillo Phillips
    m(new THREE.CylinderGeometry(0.35, 0.35, 0.03, 48), laton, { pos: [0, 0.02, lado * 0.45], rot: [Math.PI / 2, 0, 0] });
    m(new THREE.SphereGeometry(0.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), placa, { pos: [0, 0.02, lado * 0.465], rot: [lado * Math.PI / 2, 0, 0], esc: [1, 0.45, 1] });
    [1, -1].forEach((s) => m(new THREE.BoxGeometry(0.12, 0.018, 0.02), oscuro, { pos: [0, 0.02, lado * 0.508], rot: [0, 0, s * Math.PI / 4] }));

    // Resalte maquinado del venturi y bordes de los agujeros en ambas caras
    const cara = lado * 0.752;
    const giro = [0, lado === 1 ? 0 : Math.PI, 0];
    m(new THREE.RingGeometry(0.36, 0.52, 64), maquinado, { pos: [0, 0.02, cara + lado * 0.03], rot: giro });
    m(new THREE.TorusGeometry(0.52, 0.03, 12, 64), fundicion, { pos: [0, 0.02, cara] });
    m(new THREE.TorusGeometry(0.37, 0.03, 12, 64), fundicion, { pos: [0, 0.02, cara + lado * 0.02] });
    [-0.72, 0.72].forEach((x) => m(new THREE.TorusGeometry(0.13, 0.025, 10, 32), fundicion, { pos: [x, 0.05, cara] }));
  });
  m(new THREE.CircleGeometry(0.05, 24), oscuro, { pos: [0.12, -0.5, 0.753] });
  m(new THREE.CapsuleGeometry(0.035, 0.2, 4, 12), oscuro, { pos: [-0.5, -0.48, 0.752], rot: [0, 0, 1.35], esc: [1, 1, 0.15] });

  // Juntas, tapa de bombeo inferior con tornillos, topes de goma y nervaduras del lateral
  m(new THREE.BoxGeometry(2.12, 0.025, 1.48), junta, { pos: [0, 0.755, 0] });
  m(new THREE.BoxGeometry(2.08, 0.025, 1.42), junta, { pos: [0, -0.735, 0] });
  m(new RoundedBoxGeometry(2.06, 0.3, 1.4, 3, 0.06), fundicionOscura, { pos: [0, -0.88, 0] });
  [[-0.85, -0.55], [0.85, -0.55], [-0.85, 0.55], [0.85, 0.55]].forEach(([x, z]) => m(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 6), placa, { pos: [x, -1.045, z] }));
  m(new THREE.CylinderGeometry(0.1, 0.14, 0.24, 24), goma, { pos: [-0.15, -1.12, 0.25] });
  m(new THREE.CylinderGeometry(0.1, 0.14, 0.24, 24), goma, { pos: [0.45, -1.12, -0.2] });
  [-0.4, 0, 0.4].forEach((z) => m(new THREE.CapsuleGeometry(0.09, 0.3, 4, 16), fundicion, { pos: [1.08, 0.3, z], esc: [0.55, 1, 1] }));

  // Tapa negra, placa con 4 tornillos y bulbo cebador
  m(new RoundedBoxGeometry(2.2, 0.42, 1.56, 3, 0.06), tapaNegra, { pos: [0, 0.96, 0] });
  m(new RoundedBoxGeometry(1.8, 0.06, 1.35, 2, 0.03), placa, { pos: [0, 1.2, 0] });
  [[-0.72, -0.52], [0.72, -0.52], [-0.72, 0.52], [0.72, 0.52]].forEach(([x, z]) => {
    m(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24), placa, { pos: [x, 1.245, z] });
    m(new THREE.SphereGeometry(0.12, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), placa, { pos: [x, 1.26, z], esc: [1, 0.5, 1] });
    [1, -1].forEach((s) => m(new THREE.BoxGeometry(0.13, 0.02, 0.022), oscuro, { pos: [x, 1.316, z], rot: [0, s * Math.PI / 4, 0] }));
  });
  [-0.8, 0.8].forEach((x) => m(new THREE.CircleGeometry(0.025, 16), oscuro, { pos: [x, 1.0, 0.782] }));
  m(new THREE.TorusGeometry(0.5, 0.025, 10, 64), placa, { pos: [0, 1.25, 0], rot: [Math.PI / 2, 0, 0] });
  m(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 48), bulbo, { pos: [0, 1.25, 0] });
  m(new THREE.CylinderGeometry(0.42, 0.44, 0.28, 48), bulbo, { pos: [0, 1.41, 0] });
  m(new THREE.SphereGeometry(0.42, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), bulbo, { pos: [0, 1.55, 0] });

  // Entrada de combustible con codo de latón y bucle de retorno
  m(new THREE.CapsuleGeometry(0.19, 0.2, 6, 32), goma, { pos: [1.2, 0.96, -0.45], rot: [0, 0, Math.PI / 2] });
  const codo = new THREE.CatmullRomCurve3([new V(1.33, 0.96, -0.45), new V(1.63, 0.96, -0.45), new V(1.76, 0.86, -0.45), new V(1.78, 0.6, -0.45), new V(1.78, 0.35, -0.45)]);
  m(new THREE.TubeGeometry(codo, 60, 0.065, 16, false), laton);
  // Espigas y extremo abierto del codo; tuercas hexagonales donde el bucle entra al cuerpo
  [0.52, 0.42].forEach((y) => m(new THREE.TorusGeometry(0.068, 0.014, 8, 24), laton, { pos: [1.78, y, -0.45], rot: [Math.PI / 2, 0, 0] }));
  m(new THREE.CircleGeometry(0.04, 16), oscuro, { pos: [1.78, 0.349, -0.45], rot: [Math.PI / 2, 0, 0] });
  [[-0.45, 0.45], [-0.9, -0.1]].forEach(([y, z]) => m(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), laton, { pos: [1.1, y, z], rot: [0, 0, Math.PI / 2] }));
  const bucle = new THREE.CatmullRomCurve3([
    new V(1.03, -0.45, 0.45), new V(1.38, -0.5, 0.6), new V(1.68, -0.75, 0.5),
    new V(1.68, -1.02, 0.2), new V(1.38, -1.08, -0.05), new V(1.03, -0.9, -0.1),
  ]);
  m(new THREE.TubeGeometry(bucle, 80, 0.06, 16, false), laton);

  // Tornillos de regulación con resorte y capuchón de goma (lateral izquierdo)
  const helice = new THREE.Curve();
  helice.getPoint = (t, destino = new V()) => destino.set(-t * 0.32, Math.cos(t * Math.PI * 16) * 0.1, Math.sin(t * Math.PI * 16) * 0.1);
  // Capuchón hueco torneado: pared cónica, labio en la boca y fondo con hexágono
  const capuchon = new THREE.LatheGeometry(
    [[0.13, 0], [0.155, 0.04], [0.165, 0.1], [0.19, 0.38], [0.205, 0.43], [0.2, 0.46], [0.14, 0.46], [0.128, 0.42], [0.12, 0.3], [0.001, 0.3]]
      .map(([radio, y]) => new THREE.Vector2(radio, y)),
    48,
  );
  const ajuste = (pos, rot) => {
    const t = new THREE.Group();
    m(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24), fundicion, { pos: [-0.02, 0, 0], rot: [0, 0, Math.PI / 2], padre: t });
    m(new THREE.CylinderGeometry(0.05, 0.05, 0.34, 12), placa, { pos: [-0.17, 0, 0], rot: [0, 0, Math.PI / 2], padre: t });
    m(new THREE.TubeGeometry(helice, 240, 0.024, 8, false), placa, { padre: t });
    m(capuchon, goma, { pos: [-0.32, 0, 0], rot: [0, 0, Math.PI / 2], padre: t });
    m(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 6), aceroOscuro, { pos: [-0.63, 0, 0], rot: [0, 0, Math.PI / 2], padre: t });
    t.position.set(...pos);
    t.rotation.set(...rot);
    g.add(t);
  };
  ajuste([-1.08, 0.35, 0.38], [0, 0.3, 0.12]);
  ajuste([-1.08, 0.35, -0.3], [0, -0.2, 0.08]);
  ajuste([-1.08, -0.5, 0.05], [0, 0.15, -0.1]);

  // Palanca del acelerador: chapa estampada con ojal, montada en su eje
  const palanca = new THREE.Shape();
  palanca.moveTo(0.06, 0.45);
  palanca.lineTo(0.173, -0.381);
  palanca.absarc(0, -0.5, 0.21, 0.6, Math.PI - 0.6, true);
  palanca.lineTo(-0.06, 0.45);
  palanca.quadraticCurveTo(0, 0.52, 0.06, 0.45);
  const ojal = new THREE.Path();
  ojal.absarc(0, -0.5, 0.08, 0, Math.PI * 2, true);
  palanca.holes.push(ojal);
  m(new THREE.ExtrudeGeometry(palanca, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 32 }), placa, { pos: [-1.2, -0.35, 0.45], rot: [-0.35, -Math.PI / 2, 0] });
  m(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 24), aceroOscuro, { pos: [-1.14, -0.82, 0.62], rot: [0, 0, Math.PI / 2] });

  g.traverse((o) => {
    if (o.isMesh && o.material !== bulbo) o.castShadow = o.receiveShadow = true;
  });
  return { grupo: g, recursos };
}
