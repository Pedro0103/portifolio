export function initUI(state) {
  const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
  const setMenu = o => { menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Fechar menu' : 'Abrir menu'); };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  const hud = document.getElementById('hud');
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; state.p = h > 0 ? Math.min(1, scrollY / h) : 0; document.documentElement.style.setProperty('--p', state.p.toFixed(4)); hud.textContent = String(Math.round(state.p * 100)).padStart(3, '0'); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  addEventListener('pointermove', e => { state.mx = (e.clientX / innerWidth) * 2 - 1; state.my = -(e.clientY / innerHeight) * 2 + 1; }, { passive: true });
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  new IntersectionObserver(([e]) => { state.show = e.isIntersecting ? 1 : 0; }, { threshold: 0.3 }).observe(document.getElementById('projetos'));
  const SEC = [['inicio', 'Oi! Sou o guia desta viagem. Quer ver os projetos do Pedro?', 'Ver projetos', '#projetos'], ['sobre', 'Aqui você conhece o Pedro, estudante de Desenvolvimento de Sistemas.', 'Ver habilidades', '#habilidades'], ['habilidades', 'Toque em uma habilidade para ver o que ela significa.', 'Ver projetos', '#projetos'], ['projetos', 'Passe o mouse (ou toque) em um projeto e eu aponto para ele.', 'Entrar em contato', '#contato'], ['processo', 'Uma visão simples de como uma ideia vira aplicação.', 'Entrar em contato', '#contato'], ['contato', 'Fim da travessia! Fale com o Pedro por e-mail ou WhatsApp.', 'Enviar e-mail', 'mailto:p2010hv@gmail.com']];
  const setSec = i => { if (i < 0 || i === state.sec) return; state.sec = i; state.pulse = 1; document.querySelectorAll('.panel,.hero').forEach(el => el.classList.toggle('active', el.id === SEC[i][0])); };
  setSec(0);
  const so = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setSec(SEC.findIndex(s => s[0] === e.target.id))), { rootMargin: '-45% 0px -45% 0px' });
  SEC.forEach(s => so.observe(document.getElementById(s[0])));
  document.querySelectorAll('.card').forEach(c => { const on = () => { state.focus = +c.dataset.proj; state.pulse = 0.6; }, off = () => { state.focus = -1; };
    c.addEventListener('pointerenter', on); c.addEventListener('focusin', on); c.addEventListener('pointerleave', off); c.addEventListener('focusout', off); });
  const info = document.getElementById('skill-info');
  document.querySelectorAll('.skill').forEach(b => b.addEventListener('click', () => {
    state.pulse = 1;
    document.querySelectorAll('.skill').forEach(x => x.setAttribute('aria-pressed', x === b));
    info.replaceChildren(Object.assign(document.createElement('h3'), { textContent: b.dataset.t }), Object.assign(document.createElement('p'), { textContent: b.dataset.d }));
  }));
  if (!state.rm && matchMedia('(pointer:fine)').matches) document.querySelectorAll('.card').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--gx', e.clientX - r.left + 'px'); c.style.setProperty('--gy', e.clientY - r.top + 'px'); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 8 + 'deg'); c.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 8 + 'deg'); });
    c.addEventListener('pointerleave', () => { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); });
  });
}
