import { initUI } from './interactions.js';
const state = { p: 0, mx: 0, my: 0, show: 0, sec: -1, pulse: 0, focus: -1, story: 1, rm: matchMedia('(prefers-reduced-motion: reduce)').matches };
initUI(state);
(async () => {
  try {
    const c = document.getElementById('gl');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) throw new Error('WebGL indisponível');
    const { initScene } = await import('./scene.js');
    initScene(c, state);
  } catch (e) { console.warn('3D desativado:', e); document.documentElement.classList.add('no-webgl'); }
})();
