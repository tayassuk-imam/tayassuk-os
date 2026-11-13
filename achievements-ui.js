/* Tayassuk OS — Achievement & Certificate Gallery */
import { achievementDetails } from './content/achievements.js';

const LS_KEY = 'tayassuk-os-certificates';
const FILTERS = ['All', 'Programming', 'Academic', 'Competition', 'Workshop'];
const registry = new Map();
let wired = false;

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = s => 'custom-' + String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/* ---------- storage (uploaded / replaced certificates) ---------- */
function readUploads() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } }
function writeUploads(o) { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
function getCert(card) {
  const up = readUploads()[card.id];
  const src = up ? up.dataUrl : card.certificate;
  if (!src) return null;
  const isPdf = up ? up.type === 'pdf' : /\.pdf($|\?)/i.test(src);
  return { src, type: isPdf ? 'pdf' : 'image', uploaded: !!up, name: up ? up.name : (card.title.replace(/[^\w]+/g, '-') + (isPdf ? '.pdf' : '.jpg')) };
}

/* ---------- data ---------- */
function normalize(items) {
  registry.clear();
  const used = new Set();
  const cards = [];
  (items || []).forEach(item => {
    const isStr = typeof item === 'string';
    const raw = isStr ? item : (item.title || item.name || 'Achievement');
    const hit = achievementDetails.find(d => !used.has(d.id) && raw.toLowerCase().includes(d.match));
    let card;
    if (hit) { used.add(hit.id); card = { ...hit }; if (!isStr && item.certificate && !card.certificate) card.certificate = item.certificate; }
    else card = {
      id: slug(raw), title: raw, organization: isStr ? '' : (item.organization || ''), year: isStr ? '' : (item.year || ''),
      date: isStr ? '' : (item.date || ''), category: isStr ? 'Achievement' : (item.category || 'Achievement'), filters: [],
      event: '', description: isStr ? '' : (item.description || item.detail || ''),
      skills: isStr ? [] : (Array.isArray(item.skills) ? item.skills : []), certificate: isStr ? '' : (item.certificate || '')
    };
    registry.set(card.id, card); cards.push(card);
  });
  return cards;
}

/* ---------- icons ---------- */
const ICON = {
  trophy: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4"/></svg>',
  search: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  cert: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 9h10M7 12.5h6M9 17l-1.5 4 3-1.5 3 1.5L12 17"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

/* ---------- gallery markup ---------- */
function thumbHTML(card) {
  const c = getCert(card);
  if (!c) return `<span class="ach-soon">${ICON.cert}<b>Certificate Coming Soon</b></span>`;
  if (c.type === 'pdf') return `<span class="ach-pdf">${ICON.cert}<b>PDF Certificate</b><small>Click to preview</small></span>`;
  return `<img src="${esc(c.src)}" alt="${esc(card.title)} certificate" loading="lazy" draggable="false">`;
}
function cardHTML(card) {
  const hay = [card.title, card.organization, card.category, card.year, card.description, card.skills.join(' ')].join(' ').toLowerCase();
  return `<article class="ach-card" data-ach-id="${esc(card.id)}" data-filters="${esc(card.filters.join(' '))}" data-search="${esc(hay)}">
    <button type="button" class="ach-thumb" data-ach-action="preview" aria-label="Preview certificate: ${esc(card.title)}">${thumbHTML(card)}</button>
    <div class="ach-body">
      <div class="ach-meta"><span class="ach-chip">${esc(card.category)}</span>${card.year ? `<span class="ach-year">${esc(card.year)}</span>` : ''}</div>
      <h3>${esc(card.title)}</h3>
      ${card.organization ? `<p class="ach-org">${esc(card.organization)}</p>` : ''}
      <p class="ach-desc">${esc(card.description)}</p>
      <button type="button" class="ach-btn" data-ach-action="details">View Details</button>
    </div></article>`;
}
export function renderAchievementsGallery(items) {
  const cards = normalize(items);
  return `<div class="window-page ach-page">
    <div class="window-page-heading"><span class="eyebrow">Milestones</span><h1>Achievements</h1>
      <p>Activities, experiences and certificates.</p></div>
    <div class="ach-root" data-ach-root>
      <div class="ach-tools">
        <label class="ach-search">${ICON.search}<input type="search" placeholder="Search achievements…" data-ach-search aria-label="Search achievements"></label>
        <div class="ach-filters" role="tablist">${FILTERS.map((f, i) => `<button type="button" class="ach-filter${i ? '' : ' is-active'}" data-ach-filter="${f}">${f}</button>`).join('')}</div>
      </div>
      <div class="ach-grid">${cards.map(cardHTML).join('') || ''}</div>
      <div class="ach-empty" hidden>${ICON.trophy}<p>No achievements match your search.</p></div>
    </div></div>`;
}

/* ---------- filtering ---------- */
function applyFilter(root) {
  const q = (root.querySelector('[data-ach-search]').value || '').trim().toLowerCase();
  const f = root.querySelector('.ach-filter.is-active')?.dataset.achFilter || 'All';
  let shown = 0;
  root.querySelectorAll('.ach-card').forEach(c => {
    const ok = (f === 'All' || c.dataset.filters.split(' ').includes(f)) && (!q || c.dataset.search.includes(q));
    c.hidden = !ok; if (ok) shown++;
  });
  root.querySelector('.ach-empty').hidden = shown > 0;
}

/* ---------- modals ---------- */
let overlay = null, lastFocus = null;
function openOverlay(html, cls) {
  closeOverlay(true);
  lastFocus = document.activeElement;
  overlay = document.createElement('div');
  overlay.className = 'ach-overlay ' + cls;
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay && overlay.classList.add('is-open'));
  overlay.querySelector('[data-ach-close]')?.focus();
  return overlay;
}
function closeOverlay(instant) {
  if (!overlay) return;
  const o = overlay; overlay = null; zoom = null;
  o.classList.remove('is-open');
  if (instant) o.remove(); else setTimeout(() => o.remove(), 220);
  if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
}

function detailsHTML(card) {
  const c = getCert(card);
  const row = (k, v) => v ? `<div class="ach-row"><span>${k}</span><b>${esc(v)}</b></div>` : '';
  return `<div class="ach-modal" role="dialog" aria-modal="true" aria-label="${esc(card.title)}">
    <button type="button" class="ach-x" data-ach-close aria-label="Close">${ICON.close}</button>
    <div class="ach-modal-scroll">
      <span class="ach-chip">${esc(card.category)}</span>
      <h2>${esc(card.title)}</h2>
      <div class="ach-rows">${row('Organization / Institution', card.organization)}${row('Year', card.year)}${row('Date', card.date)}${row('Event', card.event)}${row('Category', card.category)}</div>
      <h4>Description</h4><p>${esc(card.description) || '<em>No description yet.</em>'}</p>
      ${card.skills.length ? `<h4>Skills Developed</h4><div class="ach-skills">${card.skills.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      <h4>Certificate</h4>
      <button type="button" class="ach-modal-cert" data-ach-action="preview-modal" data-ach-id="${esc(card.id)}">${thumbHTML(card)}</button>
      <div class="ach-actions">
        ${c ? `<a class="ach-btn" href="${esc(c.src)}" download="${esc(c.name)}">Download Certificate</a>` : ''}
        <label class="ach-btn ach-btn-ghost">${c ? 'Replace' : 'Upload'} Certificate
          <input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" data-ach-upload hidden></label>
        ${c && c.uploaded ? '<button type="button" class="ach-btn ach-btn-ghost" data-ach-action="remove-upload">Remove uploaded file</button>' : ''}
      </div>
      <p class="ach-note" data-ach-note aria-live="polite"></p>
    </div></div>`;
}
function openDetails(id) {
  const card = registry.get(id); if (!card) return;
  openOverlay(detailsHTML(card), 'ach-details').dataset.achId = id;
}

/* Lightbox with zoom + pan */
let zoom = null;
function openPreview(id) {
  const card = registry.get(id), c = card && getCert(card);
  if (!c) { openDetails(id); return; }
  const stage = c.type === 'pdf'
    ? `<iframe class="ach-pdf-frame" src="${esc(c.src)}" title="${esc(card.title)}"></iframe>`
    : `<img class="ach-zoom-img" src="${esc(c.src)}" alt="${esc(card.title)} certificate" draggable="false">`;
  const o = openOverlay(`<div class="ach-lightbox" role="dialog" aria-modal="true" aria-label="Certificate preview">
    <div class="ach-lb-bar"><strong>${esc(card.title)}</strong><div class="ach-lb-tools">
      ${c.type === 'image' ? '<button type="button" data-ach-zoom="out" aria-label="Zoom out">−</button><button type="button" data-ach-zoom="reset" class="ach-zoom-level" aria-label="Reset zoom">100%</button><button type="button" data-ach-zoom="in" aria-label="Zoom in">+</button>' : ''}
      <a class="ach-lb-dl" href="${esc(c.src)}" download="${esc(c.name)}">Download</a>
      <button type="button" class="ach-x ach-x-inline" data-ach-close aria-label="Close preview">${ICON.close}</button></div></div>
    <div class="ach-stage">${stage}</div></div>`, 'ach-preview');
  o.dataset.achId = id;
  if (c.type === 'image') zoom = { s: 1, x: 0, y: 0, el: o.querySelector('.ach-zoom-img'), lvl: o.querySelector('.ach-zoom-level') };
}
function setZoom(s, x, y) {
  if (!zoom) return;
  zoom.s = Math.min(5, Math.max(1, s));
  if (zoom.s === 1) { x = 0; y = 0; }
  zoom.x = x ?? zoom.x; zoom.y = y ?? zoom.y;
  zoom.el.style.transform = `translate(${zoom.x}px,${zoom.y}px) scale(${zoom.s})`;
  zoom.el.classList.toggle('is-zoomed', zoom.s > 1);
  zoom.lvl.textContent = Math.round(zoom.s * 100) + '%';
}

/* ---------- upload ---------- */
function say(msg, bad) { const n = overlay && overlay.querySelector('[data-ach-note]'); if (n) { n.textContent = msg; n.classList.toggle('is-bad', !!bad); } }
function readAsDataURL(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); }
async function shrinkImage(file) {
  const url = await readAsDataURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const k = Math.min(1, 1600 / Math.max(img.width, img.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
  const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/jpeg', 0.85);
}
async function handleUpload(input) {
  const id = overlay && overlay.dataset.achId, file = input.files && input.files[0];
  if (!id || !file) return;
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isImg = /^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name);
  if (!isPdf && !isImg) { say('Please choose a JPG, PNG or PDF file.', true); input.value = ''; return; }
  if (file.size > 8 * 1024 * 1024) { say('File is too large (max 8 MB).', true); input.value = ''; return; }
  try {
    const dataUrl = isPdf ? await readAsDataURL(file) : await shrinkImage(file);
    const all = readUploads(); all[id] = { name: file.name, type: isPdf ? 'pdf' : 'image', dataUrl };
    if (!writeUploads(all)) { say('Not enough browser storage for this file. Try a smaller one.', true); return; }
    refreshCard(id); const card = registry.get(id);
    overlay.innerHTML = detailsHTML(card); overlay.dataset.achId = id; say('Certificate saved on this browser.');
  } catch (e) { say('Could not read that file.', true); }
}
function refreshCard(id) {
  const card = registry.get(id); if (!card) return;
  document.querySelectorAll(`.ach-card[data-ach-id="${CSS.escape(id)}"] .ach-thumb`).forEach(t => { t.innerHTML = thumbHTML(card); });
}

/* ---------- one-time delegated wiring ---------- */
export function initAchievementsUI() {
  if (wired) return; wired = true;

  document.addEventListener('click', e => {
    const t = e.target;
    const fl = t.closest('[data-ach-filter]');
    if (fl) { const root = fl.closest('[data-ach-root]'); root.querySelectorAll('.ach-filter').forEach(b => b.classList.toggle('is-active', b === fl)); applyFilter(root); return; }
    const card = t.closest('.ach-card');
    const act = t.closest('[data-ach-action]');
    if (act) {
      const a = act.dataset.achAction;
      if (a === 'preview' && card) return openPreview(card.dataset.achId);
      if (a === 'details' && card) return openDetails(card.dataset.achId);
      if (a === 'preview-modal') return openPreview(act.dataset.achId);
      if (a === 'remove-upload') {
        const id = overlay.dataset.achId, all = readUploads(); delete all[id]; writeUploads(all); refreshCard(id);
        overlay.innerHTML = detailsHTML(registry.get(id)); overlay.dataset.achId = id; say('Uploaded certificate removed.'); return;
      }
    }
    if (t.closest('[data-ach-close]')) return closeOverlay();
    if (overlay && t === overlay) return closeOverlay();
    const z = t.closest('[data-ach-zoom]');
    if (z && zoom) { const m = z.dataset.achZoom; setZoom(m === 'in' ? zoom.s + 0.5 : m === 'out' ? zoom.s - 0.5 : 1); return; }
    if (card && !t.closest('button, a')) openDetails(card.dataset.achId);
  });

  document.addEventListener('input', e => { const s = e.target.closest('[data-ach-search]'); if (s) applyFilter(s.closest('[data-ach-root]')); });
  document.addEventListener('change', e => { const u = e.target.closest('[data-ach-upload]'); if (u) handleUpload(u); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay) { e.stopImmediatePropagation(); e.preventDefault(); closeOverlay(); } }, true);
  document.addEventListener('wheel', e => {
    if (!zoom || !overlay || !e.target.closest('.ach-stage')) return;
    e.preventDefault(); setZoom(zoom.s + (e.deltaY < 0 ? 0.25 : -0.25));
  }, { passive: false });
  document.addEventListener('dblclick', e => { if (zoom && e.target.closest('.ach-zoom-img')) setZoom(zoom.s > 1 ? 1 : 2.5); });

  let drag = null;
  document.addEventListener('pointerdown', e => {
    if (!zoom || zoom.s <= 1 || !e.target.closest('.ach-zoom-img')) return;
    drag = { x: e.clientX - zoom.x, y: e.clientY - zoom.y }; zoom.el.setPointerCapture(e.pointerId); zoom.el.classList.add('is-dragging');
  });
  document.addEventListener('pointermove', e => { if (drag && zoom) setZoom(zoom.s, e.clientX - drag.x, e.clientY - drag.y); });
  const end = () => { drag = null; zoom && zoom.el.classList.remove('is-dragging'); };
  document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
}
