import * as THREE from 'three';
import { createParticles } from './particles.js';
import { createStory } from './story.js';
import { createAnimations } from './animations.js';
export function initScene(canvas, state) {
  const mobile = innerWidth < 768, pr = Math.min(devicePixelRatio, mobile ? 1.5 : 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: true });
  renderer.setPixelRatio(pr);
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x061215, 0.03);
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 300); cam.position.z = 8; scene.add(cam);
  scene.add(new THREE.AmbientLight(0x404060, 0.35));
  const l1 = new THREE.PointLight(0x8a7fbf, 38, 30); l1.position.set(4, 3, 4);
  const l2 = new THREE.PointLight(0x7fa8c4, 30, 30); l2.position.set(-4, -2, 3);
  scene.add(l1, l2);
  // objeto central
  const hero = new THREE.Group();
  hero.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 2), new THREE.MeshStandardMaterial({ color: 0x20222c, metalness: 0.9, roughness: 0.25, flatShading: true })));
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x8a7fbf, emissive: 0x8a7fbf, emissiveIntensity: 0.3, metalness: 0.6, roughness: 0.3 });
  const rings = [1.7, 2.1].map((R, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, 0.015, 8, 128), i ? new THREE.MeshBasicMaterial({ color: 0x7fa8c4, transparent: true, opacity: 0.6 }) : ringMat); m.rotation.x = 1.2 + i; hero.add(m); return m; });
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.45, 1), new THREE.MeshBasicMaterial({ color: 0x8a7fbf, wireframe: true, transparent: true, opacity: 0.18 }));
  hero.add(shell);
  const N = mobile ? 40 : 90, sats = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xcfd3e0 }), N);
  const sd = Array.from({ length: N }, () => ({ r: 1.8 + Math.random() * 1.8, s: (Math.random() - 0.5) * 0.9, ph: Math.random() * 6.28, tx: Math.random() * 3.14, tz: Math.random() * 3.14 }));
  hero.add(sats);
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(3.2, 0.012, 300, 6, 2, 3), new THREE.MeshBasicMaterial({ color: 0x7fa8c4, transparent: true, opacity: 0.22 }));
  knot.position.set(0, 0, -6); scene.add(knot);
  const dg = new THREE.BufferGeometry(), dp = new Float32Array(1800);
  for (let i = 0; i < 1800; i += 3) { const r = 14 + Math.random() * 14, u = Math.random() * 2 - 1, a = Math.random() * 6.28, q = Math.sqrt(1 - u * u); dp.set([r * q * Math.cos(a), r * u, r * q * Math.sin(a)], i); }
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.06, color: 0x9aa0b4, transparent: true, opacity: 0.4, depthWrite: false })); scene.add(dust);
  const grid = new THREE.GridHelper(60, 40, 0x2a2d3a, 0x181a24); grid.position.y = -4.5; grid.material.transparent = true; grid.material.opacity = 0.5; 
  scene.add(hero);
  // vitrines dos projetos (filhas da câmera)
  const edge = new THREE.LineBasicMaterial({ color: 0x7fa8c4, transparent: true, opacity: 0.5 });
  const show = new THREE.Group(); show.position.set(0, 0, -20); scene.add(show);
  const pool = new THREE.Group(); pool.position.set(-4.6, -0.4, 0); pool.rotation.set(0.6, 0.4, 0);
  const table = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 1.7), new THREE.MeshStandardMaterial({ color: 0x0a3a2c, roughness: 0.6 }));
  pool.add(table, new THREE.LineSegments(new THREE.EdgesGeometry(table.geometry), edge));
  const ballGeo = new THREE.SphereGeometry(0.12, 24, 16);
  const balls = [0xe6e8ee, 0x8a7fbf, 0x7fa8c4, 0xc4a06a].map((c, i) => { const b = new THREE.Mesh(ballGeo, new THREE.MeshStandardMaterial({ color: c, metalness: 0.3, roughness: 0.2 })); b.position.y = 0.2; pool.add(b); return b; });
  const tasks = new THREE.Group(); tasks.position.set(4.6, -0.2, 0);
  const planeGeo = new THREE.PlaneGeometry(1.5, 0.7), planeEdge = new THREE.EdgesGeometry(planeGeo);
  const cards = [0, 1, 2].map(i => { const g = new THREE.Group(); g.add(new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({ color: 0x11141b, transparent: true, opacity: 0.8 })), new THREE.LineSegments(planeEdge, edge)); g.position.set(i * 0.6 - 0.6, 0.9 - i * 0.9, -i * 1.1); tasks.add(g); return g; });
  tasks.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cards.map(c => c.position)), edge));
  const spot = new THREE.SpotLight(0xe8dcc0, 70, 16, 0.6, 0.6); spot.position.set(-4.6, 4, 2); spot.target = pool; show.add(spot);
  show.add(pool, tasks); show.visible = false;
  const rim = new THREE.DirectionalLight(0x7fa8c4, 0.45); rim.position.set(-3, 2, -6); scene.add(rim);
  const sun = new THREE.DirectionalLight(0xaeb4c8, 0.55); sun.position.set(3, 6, 4); scene.add(sun);
  const story = createStory(scene, cam, mobile);
  const particles = createParticles(mobile ? 6000 : 15000, pr);
  scene.add(particles.points);
  const anim = createAnimations({ spot, fog: scene.fog, story, shell, sats, sd, knot, dust, grid, state, cam, hero, rings, show, pool, balls, tasks, cards, particles, l1, l2, mobile });
  function resize() { renderer.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  let raf = 0, last = performance.now();
  const loop = now => { raf = requestAnimationFrame(loop); const dt = Math.min((now - last) / 1000, 0.05); last = now; anim.update(dt); renderer.render(scene, cam); };
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  addEventListener('pagehide', () => { stop(); scene.traverse(o => { o.geometry?.dispose(); o.material?.dispose?.(); }); renderer.dispose(); });
  start();
}
