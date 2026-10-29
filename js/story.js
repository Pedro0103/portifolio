import * as THREE from 'three';
const ss = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
export function createStory(scene, cam, mobile) {
  const R = rng(7);
  const stone = new THREE.MeshStandardMaterial({ color: 0x4a4d5c, roughness: 0.95, flatShading: true });
  const add = (g, m, x, y, z, par) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); par.add(o); return o; };
  // astronauta: hierarquia corpo > (cabeça, mochila, braços, pernas), materiais distintos e reflexos por mapa de ambiente procedural
  let env = null;
  try { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#1b2433'); gr.addColorStop(0.5, '#05080d'); gr.addColorStop(1, '#0c1016'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    [[60, 40, 120, 26, '#ffffff'], [330, 60, 90, 18, '#dfe8ff'], [200, 150, 160, 10, '#7fa8c4'], [440, 120, 50, 40, '#c0504a']].forEach(([x, y, w, h, col]) => { g.fillStyle = col; g.globalAlpha = 0.85; g.fillRect(x, y, w, h); });
    env = new THREE.CanvasTexture(c); env.mapping = THREE.EquirectangularReflectionMapping; env.colorSpace = THREE.SRGBColorSpace; } catch (e) { env = null; }
  const mat = (c, r, m, ei) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, envMap: env, envMapIntensity: ei });
  const suit = mat(0x626a7c, 0.9, 0.02, 0.12), suit2 = mat(0x434a5a, 0.9, 0.05, 0.12), metal = mat(0x4b515e, 0.6, 0.5, 0.25), rubber = mat(0x0c0e13, 0.95, 0.02, 0.1), visor = mat(0x03050a, 0.15, 0.9, 0.6);
  const cyan = new THREE.MeshBasicMaterial({ color: 0x7fa8c4 }), red = new THREE.MeshBasicMaterial({ color: 0xc0504a });
  const A = new THREE.Group(), body = new THREE.Group(); A.add(body);
  const grp = (par, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); par.add(g); return g; };
  const cyl = (a, b, h, m, par, x, y, z) => add(new THREE.CylinderGeometry(a, b, h, 20), m, x, y, z, par);
  const sph = (r, m, par, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = add(new THREE.SphereGeometry(r, 24, 16), m, x, y, z, par); o.scale.set(sx, sy, sz); return o; };
  const ring = (r, tb, m, par, x, y, z) => { const o = add(new THREE.TorusGeometry(r, tb, 8, 32), m, x, y, z, par); o.rotation.x = Math.PI / 2; return o; };
  const box = (w, h, d, m, par, x, y, z) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, par);
  // tronco (perfil de revolução, levemente achatado), cinto, colarinho e painel de controle
  const core = grp(body, 0, 0, 0); core.scale.z = 0.85;
  add(new THREE.LatheGeometry([[0.001, -0.46], [0.24, -0.46], [0.29, -0.36], [0.31, -0.12], [0.35, 0.12], [0.37, 0.28], [0.3, 0.4], [0.16, 0.44], [0.001, 0.44]].map(([x, y]) => new THREE.Vector2(x, y)), 28), suit, 0, 0, 0, core);
  ring(0.3, 0.035, metal, core, 0, -0.34, 0); ring(0.2, 0.04, metal, core, 0, 0.42, 0);
  box(0.24, 0.16, 0.05, suit2, body, 0, 0.1, 0.3); box(0.18, 0.015, 0.01, cyan, body, 0, 0.19, 0.33);
  [[-0.07, cyan], [0, red], [0.07, cyan]].forEach(([x, m]) => sph(0.02, m, body, x, 0.08, 0.33));
  // cabeça: capacete, visor amplo reflexivo, colarinho e módulos laterais
  const head = grp(body, 0, 0.62, 0); sph(0.34, suit, head, 0, 0.06, 0, 1, 1.04, 1);
  add(new THREE.SphereGeometry(0.352, 32, 20, Math.PI / 2 - 0.95, 1.9, 0.5, 1.45), visor, 0, 0.06, 0, head).scale.set(1, 1.04, 1);
  ring(0.27, 0.025, metal, head, 0, -0.18, 0); box(0.08, 0.03, 0.05, cyan, head, 0, 0.4, 0.06);
  [-1, 1].forEach(s => { cyl(0.05, 0.05, 0.1, metal, head, s * 0.345, 0.04, 0).rotation.z = Math.PI / 2; });
  // mochila com tanques, faixa luminosa e mangueira até o peito
  const bp = grp(body, 0, 0.02, -0.36); box(0.56, 0.72, 0.26, suit2, bp, 0, 0, 0); box(0.5, 0.1, 0.2, suit, bp, 0, 0.4, 0); box(0.36, 0.025, 0.012, cyan, bp, 0, 0.28, -0.135);
  [-1, 1].forEach(s => { cyl(0.09, 0.09, 0.5, metal, bp, s * 0.16, -0.05, -0.17); sph(0.09, metal, bp, s * 0.16, 0.2, -0.17); });
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.2, 0.15, -0.3), new THREE.Vector3(0.42, 0.05, -0.12), new THREE.Vector3(0.34, -0.02, 0.2), new THREE.Vector3(0.12, 0.08, 0.3)]), 24, 0.022, 8, false), rubber, 0, 0, 0, body);
  // braços: ombro > cotovelo > luva
  const mkArm = s => { const sh = grp(body, s * 0.43, 0.28, 0); sph(0.15, suit2, sh, 0, 0, 0, 1, 0.9, 1.05);
    cyl(0.095, 0.085, 0.34, suit, sh, 0, -0.2, 0); ring(0.09, 0.012, metal, sh, 0, -0.1, 0); ring(0.092, 0.015, suit2, sh, 0, -0.34, 0);
    const el = grp(sh, 0, -0.38, 0); el.rotation.x = -0.3; sph(0.092, suit2, el, 0, 0, 0); cyl(0.085, 0.075, 0.3, suit, el, 0, -0.17, 0); ring(0.08, 0.02, metal, el, 0, -0.33, 0);
    sph(0.095, rubber, el, 0, -0.42, 0, 1, 1.15, 0.9); sph(0.035, rubber, el, -s * 0.08, -0.4, 0.04); return [sh, el]; };
  const [armL, elL] = mkArm(-1), [armR, elR] = mkArm(1);
  // pernas: quadril > joelho > bota
  const mkLeg = s => { const hp = grp(body, s * 0.16, -0.46, 0); hp.rotation.x = -0.15; sph(0.14, suit2, hp, 0, 0, 0);
    cyl(0.13, 0.11, 0.38, suit, hp, 0, -0.2, 0); ring(0.12, 0.014, metal, hp, 0, -0.36, 0);
    const kn = grp(hp, 0, -0.4, 0); sph(0.105, suit2, kn, 0, 0, 0); cyl(0.11, 0.095, 0.36, suit, kn, 0, -0.19, 0); ring(0.1, 0.02, metal, kn, 0, -0.36, 0);
    cyl(0.1, 0.115, 0.14, rubber, kn, 0, -0.43, 0); box(0.2, 0.1, 0.34, rubber, kn, 0, -0.53, 0.07); return [hp, kn]; };
  const [legL, knL] = mkLeg(-1), [legR, knR] = mkLeg(1);
  // luzes locais: principal suave, contorno frio por trás e leve tom avermelhado por baixo
  const AL = [];
  [[0xfff1e0, 12, 8, -1.4, 1.6, 2], [0x7fa8c4, 22, 8, 1.4, 1.2, -1.8], [0xc0504a, 6, 6, -1.2, -1, 1.2]].forEach(([c, i, d, x, y, z]) => { const l = new THREE.PointLight(c, i, d); l.position.set(x, y, z); A.add(l); AL.push(l); });
  scene.add(A);

  // ---- mundo: ponte de pedras, colunas, arcos, pilastras de salto e buraco negro
  const FY = -3.4 + 1.09, BHP = new THREE.Vector3(0, 2.8, -47.5), d = new THREE.Object3D(), v = new THREE.Vector3(), S0 = mobile ? 0.5 : 0.62, CD = [];
  const ruins = new THREE.Group(); ruins.position.set(0, -3.4, -46); scene.add(ruins);
  add(new THREE.CircleGeometry(13, 40), new THREE.MeshStandardMaterial({ color: 0x14161d, roughness: 1 }), 0, 0, 0, ruins).rotation.x = -Math.PI / 2;
  add(new THREE.CylinderGeometry(5.2, 5.6, 0.35, 10), stone, 0, 0.17, -1, ruins);
  const cg = new THREE.CylinderGeometry(0.34, 0.42, 1, 10); cg.translate(0, 0.5, 0);
  const cols = new THREE.InstancedMesh(cg, stone, 18);
  for (let i = 0; i < 18; i++) {
    if (i < 12) { const a = i / 12 * 6.28 + R() * 0.3, r = 3.4 + R() * 2.2; d.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r - 1); d.scale.set(1, 1.2 + R() * 3.2, 1); d.rotation.set((R() - 0.5) * 0.12, 0, (R() - 0.5) * 0.12); }
    else { d.position.set((R() - 0.5) * 9, 0.45, (R() - 0.5) * 7 - 1); d.scale.set(1, 0.5 + R() * 0.7, 1); d.rotation.set(0, R() * 3, Math.PI / 2); }
    d.updateMatrix(); cols.setMatrixAt(i, d.matrix); CD.push({ x: d.position.x, z: d.position.z, top: i < 12 ? 0.3 + d.scale.y : 0.87, r: i < 12 ? 0.45 : 0.6 });
  }
  ruins.add(cols);
  // trajeto: saltos em gravidade zero pela ponte, depois pelas pilastras da frente, e abdução pelo centro da praça
  const TG = CD.filter(c => c.top >= 1.5 && c.z >= 1.5).sort((a, b) => a.x - b.x).slice(0, 4);
  const SG = []; let tot = 0; const addSeg = o => { o.s0 = tot; tot += o.L; SG.push(o); };
  const clearOf = (a, b, H, c1, c2) => { for (let i = 1; i < 30; i++) { const e = i / 30, x = a.x + (b.x - a.x) * e, z = a.z + (b.z - a.z) * e, y = a.y + (b.y - a.y) * e + H * 4 * e * (1 - e);
      for (const c of CD) if (c !== c1 && c !== c2 && Math.hypot(x - c.x, z - c.z) < c.r + 0.35 && y < c.top + 0.45) return false; } return true; };
  addSeg({ t: 'stand', idle: true, a: { x: 0, z: 42.5, y: 1.09 }, h: Math.PI, L: 1.5 });
  for (let k = 0; k < 10; k++) addSeg({ t: 'leap', a: { x: 0, z: 42.5 - 3.95 * k, y: 1.09 }, b: { x: 0, z: 42.5 - 3.95 * (k + 1), y: 1.09 }, H: 1.5, L: 3.9 });
  { let cur = { x: 0, z: 3, y: 1.09, c: null };
    const go = (b, h) => { const dist = Math.hypot(b.x - cur.x, b.z - cur.z); let H = 1.4 + 0.05 * dist; while (!clearOf(cur, b, H, cur.c, b.c) && H < 9) H += 0.3; addSeg({ t: 'leap', a: cur, b, H, L: 3.5 + dist * 0.5 }); addSeg({ t: 'stand', a: b, h, L: b.c ? 2 : 1.6 }); cur = b; };
    TG.forEach((c, k) => { const n = TG[k + 1] || { x: -0.15, z: -1.5 }; go({ x: c.x, z: c.z, y: c.top, c }, Math.atan2(n.x - c.x, n.z - c.z)); });
    go({ x: -0.15, z: -1.5, y: 0.35, c: null }, Math.PI); }
  const KB = [[0, 0], [0.04, 0], [0.12, 6], [0.26, 15], [0.4, 23], [0.52, 31], [0.62, 38], [0.7, 41], [0.84, tot]];
  const sAt = p => { if (p >= 0.84) return tot; let i = 0; while (i < KB.length - 2 && p > KB[i + 1][0]) i++; const a = KB[i], b = KB[i + 1]; return a[1] + (b[1] - a[1]) * ss(a[0], b[0], p); };
  const Q = { x: 0, z: 0, y: 0, sy: 0, fl: 0, c: 0, w: 0, st: 0, h: Math.PI, u: -1 };
  function segAt(s) { s = Math.min(Math.max(s, 0), tot - 1e-4); let i = 0; while (i < SG.length - 1 && s >= SG[i + 1].s0) i++; const g = SG[i], l = (s - g.s0) / g.L;
    Q.fl = 0; Q.c = 0; Q.w = 0; Q.st = 0; Q.u = -1; Q.hv = 0;
    if (g.t === 'walk') { Q.x = 0; Q.z = g.a.z + (g.b.z - g.a.z) * l; Q.y = Q.sy = 1.09; Q.w = 1; Q.h = Math.PI; Q.c = 0.8 * ss(g.L - 0.8, g.L, s - g.s0); }
    else if (g.t === 'leap') { Q.x = g.a.x + (g.b.x - g.a.x) * l; Q.z = g.a.z + (g.b.z - g.a.z) * l; Q.y = g.a.y + (g.b.y - g.a.y) * l + g.H * 4 * l * (1 - l); Q.sy = l < 0.5 ? g.a.y : g.b.y;
      Q.fl = Math.sin(Math.PI * l); Q.u = l; Q.h = Math.atan2(g.b.x - g.a.x, g.b.z - g.a.z); Q.c = 0.8 * (1 - ss(0, 0.2, l)) + 0.8 * ss(0.8, 1, l); }
    else { Q.x = g.a.x; Q.z = g.a.z; Q.y = Q.sy = g.a.y; Q.st = 1; Q.h = g.h; Q.hv = g.idle ? 1 : 0.1; Q.c = (g.idle ? 0 : 0.8 * (1 - ss(0, 0.3, l))) + 0.8 * ss(0.7, 1, l); }
    return Q; }
  const slab = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, 0.18, 1.9), stone, 22); let sn = 0;
  for (let k = 0; k < 22; k++) { const zz = 1.5 + k * 2; if (k > 1 && R() < 0.2) continue; d.position.set((R() - 0.5) * 0.12, 1, zz); d.scale.set(1, 1, 1); d.rotation.set((R() - 0.5) * 0.03, (R() - 0.5) * 0.05, (R() - 0.5) * 0.03); d.updateMatrix(); slab.setMatrixAt(sn++, d.matrix); }
  slab.count = sn; ruins.add(slab);
  const rail = new THREE.InstancedMesh(cg, stone, 18);
  for (let k = 0; k < 9; k++) for (let j = 0; j < 2; j++) { d.position.set((j ? 1 : -1) * 1.55, 1, 6 + k * 4.6); d.scale.set(0.7, 0.6 + R() * 2, 0.7); d.rotation.set(0, 0, (R() - 0.5) * 0.08); d.updateMatrix(); rail.setMatrixAt(k * 2 + j, d.matrix); }
  ruins.add(rail);
  [12, 26, 38].forEach((z, n) => { const g = new THREE.CylinderGeometry(0.3, 0.36, 3.2, 10); add(g, stone, -1.6, 2.7, z, ruins); add(g, stone, 1.6, n === 2 ? 1.9 : 2.7, z, ruins); if (n < 2) add(new THREE.TorusGeometry(1.6, 0.22, 8, 24, Math.PI), stone, 0, 4.3, z, ruins); });
  // pilastras novas no fim do caminho: o astronauta salta sobre elas
  // buraco negro: horizonte, disco de acreção em shader, halo e luz
  const bh = new THREE.Group(); bh.position.set(0, 6.2, -1.5); ruins.add(bh);
  add(new THREE.SphereGeometry(1.4, 32, 20), new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0, 0, bh);
  const bhu = { uT: { value: 0 } };
  const disk = new THREE.Mesh(new THREE.RingGeometry(1.7, 5.6, 96, 1), new THREE.ShaderMaterial({ uniforms: bhu, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform float uT;varying vec2 vP;void main(){float r=(length(vP)-1.7)/3.9;float a=atan(vP.y,vP.x);float s=.5+.5*sin(a*5.+uT*1.6-r*16.);float b=smoothstep(0.,.08,r)*(1.-smoothstep(.55,1.,r));vec3 c=mix(vec3(1.,.88,.7),vec3(.5,.52,.78),smoothstep(.1,.8,r));gl_FragColor=vec4(c*(.45+.8*s)*b,b*(.35+.65*s));}' }));
  disk.rotation.x = -1.2; bh.add(disk);
  const halo = add(new THREE.TorusGeometry(1.55, 0.05, 8, 64), new THREE.MeshBasicMaterial({ color: 0xe8dcc0, transparent: true, opacity: 0.8 }), 0, 0, 0, bh);
  const pl = new THREE.PointLight(0xc8b8a0, 22, 18); bh.add(pl);
  // fragmentos soltos que se reúnem em órbita do buraco negro
  const N = 36, fr = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.28, 0), stone, N), S = [], FA = [], T = new THREE.Vector3();
  for (let i = 0; i < N; i++) { S.push(new THREE.Vector3((R() - 0.5) * 14, 2 + R() * 6, R() * 40 - 1)); FA.push(i / N * 6.28); }
  ruins.add(fr);
  const NP = 40, pa = new Float32Array(NP * 3), pat = new THREE.BufferAttribute(pa, 3), pg = new THREE.BufferGeometry();
  pg.setAttribute('position', pat); const pmat = new THREE.PointsMaterial({ size: 0.09, color: 0xa0a6b4, transparent: true, depthWrite: false }), puff = new THREE.Points(pg, pmat); puff.frustumCulled = false; scene.add(puff);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; scene.add(shadow);
  let aL = 0.4, aR = -0.4, hdc = 0;
  return { A, cols: CD, targets: TG, segs: SG, L: tot, sampleS(s) { segAt(s); return [Q.x, Q.z, Q.y, Q.fl, Q.st]; }, focal: BHP, posAt(pp, o) { segAt(sAt(pp)); return o.set(Q.x, -3.4 + Q.y, -46 + Q.z); },
    update(t, p, mx, my, on, st, dt, ease) {
      const k2 = 1 - Math.exp(-6 * dt), f = st.focus, s = sAt(p), D = s, Q = segAt(s), ju = Q.u, fl = Q.fl, rm = st.rm ? 0 : 1;
      const lose = ss(0.84, 0.88, p), lift = ss(0.84, 0.9, p), ab = Math.pow(Math.min(1, Math.max(0, (p - 0.89) / 0.09)), 2.2), gone = ss(0.972, 0.99, p), greet = 1 - ss(0.03, 0.05, p);
      const c = Q.c * (1 - lose), w = ss(0.04, 0.07, p) * (1 - lose) * Q.w, gait = D / 1.7 * 6.2832, sn = Math.sin(gait), cs = Math.cos(gait), sa = Math.abs(sn);
      const thL = -0.15 + 0.75 * w * sn - 0.6 * c - 0.5 * fl, thR = -0.15 - 0.75 * w * sn - 0.6 * c - 0.35 * fl;
      const kL = 0.12 + 0.35 * w * Math.max(0, -cs) + c + 0.5 * fl, kR = 0.12 + 0.35 * w * Math.max(0, cs) + c + 0.6 * fl;
      legL.rotation.x = thL; legR.rotation.x = thR; knL.rotation.x = kL; knR.rotation.x = kR;
      const RL = 0.46 + 0.4 * Math.cos(thL) + 0.58 * Math.cos(thL + kL), RR = 0.46 + 0.4 * Math.cos(thR) + 0.58 * Math.cos(thR + kR); // o pé mais baixo toca a pedra
      const scG = S0 * (0.55 + 0.45 * ease) * on * (1 - gone); A.scale.set(Math.max(0.0001, scG * (1 - 0.35 * ab)), Math.max(0.0001, scG * (1 + 0.9 * ab)), Math.max(0.0001, scG * (1 - 0.35 * ab)));
      // gravidade zero: passos leves e flutuação contínua; no fim, sobe e é sugado em espiral
      const px = Q.x + Math.sin(t * 0.7) * 0.1 * rm * (1 - Q.st), zw = -46 + Q.z, FYw = -3.4 + Q.y;
      const y0 = FYw + Math.max(RL, RR) * scG + lift * 1.6 + (((0.18 + 0.1 * Math.sin(t * 0.8)) * Q.hv + 0.03 * Math.sin(t * 1.3) * Q.st) + 0.3 * w * Math.pow(sa, 0.8)) * scG * 1.3 * (1 - ab) * rm;
      A.position.set(px * (1 - ab) + BHP.x * ab + Math.sin(ab * 7) * 1.5 * ab * (1 - ab), y0 + (BHP.y - y0) * ab, zw + (BHP.z - zw) * ab);
      let dh = (p > 0.035 ? Q.h : 0) - hdc; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); hdc += dh * Math.min(1, k2 * 0.8);
      A.rotation.set(ab * 0.9 + Math.sin(t * 0.5) * 0.08 * rm, hdc, Math.sin(ab * 9) * 0.6 * ab + Math.sin(t * 0.4) * 0.07 * rm);
      body.rotation.set(0.2 * w + 0.1 * w * cs + 0.28 * c + 0.12 * fl + 0.35 * lift + 0.2 * lose + 0.4 * ab + Math.sin(t * 0.7) * 0.06 * rm, Math.sin(gait * 0.5) * 0.12 * w, Math.sin(gait) * 0.1 * w + Math.sin(t * 0.55) * 0.07 * rm - (ju >= 0 ? 0.3 * Math.sin(ju * 6.2832) : 0));
      const wv = 0.5 + 0.5 * Math.sin(t * 7), wv2 = 0.5 + 0.5 * Math.sin(t * 7 + 2);
      let tL = 0.4 - 0.9 * w - 1.2 * fl - 1.3 * lose * wv, tR = -0.4 + 0.9 * w + 1.2 * fl + 1.3 * lose * wv2;
      tR = tR * (1 - greet) + (-2.5 + Math.sin(t * 4) * 0.25) * greet;
      if (fl === 0 && lose === 0 && c === 0 && greet === 0) { if (f === 0) tL = -1.4; else if (f === 1) tR = 1.45; }
      tL += Math.sin(t * 1.1) * 0.12 * rm - 0.8 * ab; tR += Math.sin(t * 1.1 + 2) * 0.12 * rm + 0.8 * ab;
      aL += (tL - aL) * k2; aR += (tR - aR) * k2; armL.rotation.z = aL; armR.rotation.z = aR;
      armL.rotation.x = -0.8 * w * sn + 0.6 * c - 0.5 * fl + 0.3 * lift; armR.rotation.x = 0.8 * w * sn + 0.6 * c - 0.5 * fl + 0.3 * lift; elL.rotation.z = aL * 0.25; elR.rotation.z = aR * 0.25;
      head.rotation.y += (mx * 0.5 - head.rotation.y) * k2; head.rotation.x += (-my * 0.3 - 0.35 * lift - head.rotation.x) * k2;
      AL[0].intensity = 4 * (1 - 0.5 * lift); AL[1].intensity = 8 + 10 * lift + 60 * ab; AL[2].intensity = 3 + 8 * lift + 40 * ab;
      shadow.position.set(px, -3.4 + Q.sy + 0.03, zw); shadow.material.opacity = 0.5 * (1 - fl) * (1 - lift) * on * (1 - gone);
      const rb = ss(0.62, 0.82, p);
      for (let n = 0; n < N; n++) { const a = FA[n] + t * 0.4 * rm; T.set(Math.cos(a) * 4.4, 6.2 + Math.sin(a * 3) * 0.3, Math.sin(a) * 4.4 - 1.5); v.copy(S[n]).lerp(T, rb); v.y += Math.sin(t * 0.6 + n) * 0.15;
        d.position.copy(v); d.scale.setScalar(1); d.rotation.set(t * 0.2 + n, t * 0.15, n); d.updateMatrix(); fr.setMatrixAt(n, d.matrix); }
      for (let i = 0; i < NP; i++) { const l = (i * 0.618) % 1, a = i * 2.4 + t * 0.25 * rm, r = 0.5 + 0.6 * l; pa[i * 3] = px + Math.cos(a) * r; pa[i * 3 + 1] = y0 + (l - 0.5) * 1.6 + Math.sin(t * 0.6 * rm + i) * 0.1; pa[i * 3 + 2] = zw + Math.sin(a) * r; }
      pat.needsUpdate = true; pmat.opacity = 0.4 * on * (1 - gone); // poeira que sobe devagar dos passos (gravidade zero)
      fr.instanceMatrix.needsUpdate = true; bhu.uT.value = t; halo.quaternion.copy(cam.quaternion);
    } };
}
