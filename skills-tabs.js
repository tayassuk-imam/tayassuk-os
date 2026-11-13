/* Dashboard Skills card: working category tabs */
import { skillCategories } from './content/skill-categories.js';

const card = document.querySelector('.skills-card-mini');
if (card) {
  const tabsEl = card.querySelector('.skill-tabs');
  const first = card.querySelector('.skill-mini');
  const rows = document.createElement('div');
  rows.className = 'skill-rows';
  card.querySelectorAll('.skill-mini').forEach(n => n.remove());
  tabsEl.insertAdjacentElement('afterend', rows);

  tabsEl.innerHTML = skillCategories.map((c, i) =>
    `<button type="button" role="tab" class="skill-tab${i ? '' : ' active'}" data-cat="${c.id}" aria-selected="${i ? 'false' : 'true'}">${c.label}</button>`).join('');
  tabsEl.setAttribute('role', 'tablist');

  const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function show(id, animate) {
    const cat = skillCategories.find(c => c.id === id) || skillCategories[0];
    tabsEl.querySelectorAll('.skill-tab').forEach(b => {
      const on = b.dataset.cat === cat.id;
      b.classList.toggle('active', on); b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    const paint = () => {
      rows.innerHTML = cat.items.map(s =>
        `<div class="skill-mini"><span>${esc(s.name)}</span><div class="progress-track"><span style="width:0%" data-w="${s.level}"></span></div></div>`).join('');
      rows.classList.remove('is-out');
      requestAnimationFrame(() => requestAnimationFrame(() =>
        rows.querySelectorAll('[data-w]').forEach(b => { b.style.width = b.dataset.w + '%'; })));
    };
    if (!animate) return paint();
    rows.classList.add('is-out');
    setTimeout(paint, 160);
  }
  show(skillCategories[0].id, false);

  /* Capture phase so the card's "open Skills window" handler doesn't fire for tab clicks */
  card.addEventListener('click', e => {
    const b = e.target.closest('.skill-tab');
    if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (!b.classList.contains('active')) show(b.dataset.cat, true);
  }, true);
}
