import * as THREE from 'three';
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const ss = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); };
// planos de câmera: [p, posição xyz, alvo xyz, fov]
const SH = [[0, 0, 0.4, 8, 1.2, 0, 0, 55], [0.15, -0.8, 0.8, 2, 1, 0.8, -14, 54], [0.32, 0.8, 0.4, -6, 0, 0.2, -22, 50], [0.5, 0, 0.5, -12, 0, 0, -30, 58], [0.72, -0.6, 0.9, -26, 0, 2, -42, 52], [0.9, 0, 1.1, -34, 0, 2.2, -47, 50], [1, 0, 1, -37, 0, 3, -50, 48]];
const sk = [0, 0, 0, 0, 0, 0, 0];
function shot(p) { let i = 0; while (i < SH.length - 2 && p > SH[i + 1][0]) i++; const a = SH[i], b = SH[i + 1], f = ss(a[0], b[0], p); for (let j = 0; j < 7; j++) sk[j] = a[j + 1] + (b[j + 1] - a[j + 1]) * f; }
export function createAnimations(o) {
  const { spot, fog, story, shell, sats, sd, knot, dust, state, cam, hero, rings, show, pool, balls, tasks, cards, particles, l1, l2, mobile } = o;
  const gv = new THREE.Vector3(), foc = new THREE.Vector3(), SP = new THREE.Vector3(0, 0, -20), OFF = new THREE.Vector3(), dm = new THREE.Object3D(), U = particles.uniforms, v = new THREE.Vector3(), look = new THREE.Vector3(), m = state.rm ? 0 : 1;
  let fp0 = 0, fp1 = 0, sc = 0, p = 0, t = 0, intro = 0, sh = 0, mx = 0, my = 0;
  return { update(dt) {
    t += dt * m; intro = Math.min(1, intro + dt / (state.rm ? 0.01 : 2.5));
    p = damp(p, state.p, 4, dt); sh = damp(sh, state.show, 3, dt); sc = damp(sc, state.story, 3, dt); mx = damp(mx, state.mx, 3, dt); my = damp(my, state.my, 3, dt);
    const ease = 1 - Math.pow(1 - intro, 3);
    shot(p); const fov = sk[6] + (mobile ? 8 : 0);
    cam.position.set(sk[0] + mx * 0.3 * m, sk[1] + my * 0.15 * m, sk[2]); look.set(sk[3], sk[4], sk[5]); cam.lookAt(look);
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = fov; cam.updateProjectionMatrix(); }
    const pz = cam.position.z - 3; particles.points.position.z = pz;
    U.uT.value = t; U.uP.value = p * 3; U.uIn.value = ease;
    v.set(state.mx, state.my, 0.5).unproject(cam).sub(cam.position).normalize();
    const d = (pz - cam.position.z) / v.z; U.uM.value.copy(cam.position).addScaledVector(v, d); U.uM.value.z -= pz;
    if (state.rm) U.uM.value.set(99, 99, 0);
    story.update(t, p, mx, my, sc, state, dt, ease);
    // o núcleo do início viaja até o buraco negro e passa o papel de foco
    const tr = ss(0.08, 0.38, p);
    hero.position.set(mobile ? 0 : 2.3, 0, 0).lerp(story.focal, tr);
    hero.scale.setScalar(Math.max(0.001, ease * (mobile ? 0.7 : 1) * (1 - tr * 0.85) * (1 - ss(0.4, 0.5, p))));
    foc.copy(hero.position).lerp(SP, sh * 0.7); if (p > 0.85) foc.lerp(story.focal, ss(0.85, 0.95, p));
    U.uF.value.copy(foc); U.uF.value.z -= pz; U.uSafe.value = mobile ? 0 : 1;
    fog.density = 0.03 - 0.008 * ss(0.3, 0.9, p);
    hero.rotation.y = t * 0.3 + p * 3; hero.rotation.x = my * 0.2 * m;
    rings[0].rotation.z = t * 0.4; rings[1].rotation.z = -t * 0.3;
    l1.position.copy(foc).add(OFF.set(3, 3, 3)); l1.intensity = 45; l2.position.set(cam.position.x - 4, cam.position.y - 2, cam.position.z - 2); l2.intensity = 22;
    shell.rotation.y = -t * 0.15; shell.rotation.x = t * 0.1;
    for (let i = 0; i < sd.length; i++) { const e = sd[i], a = e.ph + t * e.s; dm.position.set(Math.cos(a) * e.r, Math.sin(a * 0.7) * 0.5, Math.sin(a) * e.r); dm.rotation.set(e.tx, 0, e.tz); dm.position.applyEuler(dm.rotation); dm.rotation.set(0, 0, 0); dm.updateMatrix(); sats.setMatrixAt(i, dm.matrix); }
    sats.instanceMatrix.needsUpdate = true;
    knot.rotation.set(t * 0.05 + p * 3, t * 0.07, 0); knot.position.x = Math.sin(p * 6) * 2; knot.position.z = cam.position.z - 14; dust.position.z = cam.position.z; dust.rotation.y = t * 0.01 + p * 0.6;
    fp0 = damp(fp0, state.focus === 0 ? 1 : 0, 6, dt); fp1 = damp(fp1, state.focus === 1 ? 1 : 0, 6, dt);
    show.visible = sh > 0.01; show.scale.setScalar(sh * (mobile ? 0.55 : 1));
    if (show.visible) {
      balls.forEach((b, i) => b.position.set(Math.sin(t * 0.8 + i * 1.7) * 1.2, 0.2, Math.cos(t * 0.6 + i * 2.3) * 0.6));
      pool.rotation.y = 0.4 + Math.sin(t * 0.3) * 0.15;
      cards.forEach((c, i) => c.position.y = 0.9 - i * 0.9 + Math.sin(t + i) * 0.06);
      tasks.rotation.y = -0.4 + Math.sin(t * 0.3) * 0.1;
      pool.scale.setScalar(1 + 0.1 * fp0); tasks.scale.setScalar(1 + 0.1 * fp1); spot.intensity = 70 + 70 * fp0;
    }
  } };
}
