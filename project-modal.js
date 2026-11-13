/* Featured Project "View Details" popup (same page, no redirect) */
import { projects as fallback } from './content/projects.js';

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let overlay = null, lastFocus = null;

function getProject(id) {
  const list = (window.__getPortfolio && window.__getPortfolio().projects) || fallback;
  return list.find(p => p.id === id) || list.find(p => p.featured) || list[0] || fallback[0];
}
function html(p) {
  const feats = p.keyFeatures || [], objs = p.objectives || [], tech = p.technologies || [];
  return `<div class="pm-modal" role="dialog" aria-modal="true" aria-labelledby="pm-title">
    <button type="button" class="pm-x" data-pm-close aria-label="Close">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    <div class="pm-scroll">
      ${p.image ? `<div class="pm-shot"><img src="${esc(p.image)}" alt="${esc(p.name)} screenshot" draggable="false"></div>` : ''}
      <div class="pm-head"><span class="pm-badge">● ${esc(p.status || 'Working / Live')}</span><h2 id="pm-title">${esc(p.name)}</h2></div>
      <div class="pm-facts">
        <div><span>My Role</span><b>${esc(p.role || 'Solo Developer')}</b></div>
        <div><span>Project Status</span><b>${esc(p.status || 'Working / Live')}</b></div>
      </div>
      <h4>Project Overview</h4><p>${esc(p.overview || p.description)}</p>
      ${objs.length ? `<h4>Project Objectives</h4><ul class="pm-list">${objs.map(o => `<li>${esc(o)}</li>`).join('')}</ul>` : ''}
      ${feats.length ? `<h4>Key Features</h4><div class="pm-feats">${feats.map(f => `<span><i></i>${esc(f)}</span>`).join('')}</div>` : ''}
      ${tech.length ? `<h4>Technologies Used</h4><div class="pm-tech">${tech.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
    </div></div>`;
}
function open(id) {
  close(true);
  lastFocus = document.activeElement;
  overlay = document.createElement('div');
  overlay.className = 'pm-overlay';
  overlay.innerHTML = html(getProject(id));
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay && overlay.classList.add('is-open'));
  overlay.querySelector('[data-pm-close]').focus();
}
function close(instant) {
  if (!overlay) return;
  const o = overlay; overlay = null;
  o.classList.remove('is-open');
  if (instant) o.remove(); else setTimeout(() => o.remove(), 240);
  if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
}

/* Capture phase: runs before the card's own "open Projects" handler,
   so View Details only opens the popup and nothing else. */
document.addEventListener('click', e => {
  const btn = e.target.closest('.project-card-mini [data-action="project-detail"]');
  if (btn) { e.preventDefault(); e.stopImmediatePropagation(); open(btn.dataset.project); return; }
  if (overlay && (e.target === overlay || e.target.closest('[data-pm-close]'))) { e.stopImmediatePropagation(); close(); }
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && overlay) { e.stopImmediatePropagation(); e.preventDefault(); close(); }
}, true);
