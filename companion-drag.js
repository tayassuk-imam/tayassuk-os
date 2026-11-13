/* Draggable profile widget (#companion): mouse + touch, saved position, reset */
(function () {
  'use strict';
  var KEY = 'tayassuk-os-companion-pos';
  var box = document.getElementById('companion');
  if (!box) return;
  var drag = null, moved = false;

  function clamp(x, y) {
    var r = box.getBoundingClientRect(), m = 8;
    var maxX = window.innerWidth - r.width - m, maxY = window.innerHeight - r.height - m;
    return { x: Math.min(Math.max(m, x), Math.max(m, maxX)), y: Math.min(Math.max(m, y), Math.max(m, maxY)) };
  }
  function place(x, y) {
    var c = clamp(x, y);
    box.style.setProperty('left', c.x + 'px', 'important');
    box.style.setProperty('top', c.y + 'px', 'important');
    box.style.setProperty('right', 'auto', 'important');
    box.style.setProperty('bottom', 'auto', 'important');
    return c;
  }
  function resetPos() {
    ['left', 'top', 'right', 'bottom'].forEach(function (p) { box.style.removeProperty(p); });
    try { localStorage.removeItem(KEY); } catch (e) {}
    box.classList.remove('is-moved');
  }
  function restore() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && isFinite(s.x) && isFinite(s.y)) { place(s.x, s.y); box.classList.add('is-moved'); }
    } catch (e) {}
  }
  function ensureReset() {
    if (box.querySelector('.companion-reset')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'companion-reset'; b.title = 'Reset position'; b.setAttribute('aria-label', 'Reset widget position');
    b.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg>';
    box.appendChild(b);
  }

  box.addEventListener('pointerdown', function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('a, button, input, select, textarea')) return;   // links/buttons inside never start a drag
    var r = box.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY };
    moved = false;
    try { box.setPointerCapture(e.pointerId); } catch (err) {}
  });
  box.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!moved && Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 4) return;
    moved = true; box.classList.add('is-dragging', 'is-moved');
    place(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  function end() {
    if (!drag) return;
    drag = null; box.classList.remove('is-dragging');
    if (moved) {
      var r = box.getBoundingClientRect();
      try { localStorage.setItem(KEY, JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) })); } catch (e) {}
    }
  }
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('click', function (e) {
    if (e.target.closest('.companion-reset')) { e.stopPropagation(); resetPos(); }
    else if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);
  window.addEventListener('resize', function () {
    if (!box.classList.contains('is-moved')) return;
    var r = box.getBoundingClientRect(); place(r.left, r.top);
  });
  new MutationObserver(ensureReset).observe(box, { childList: true });   // app.js re-renders its contents
  ensureReset(); restore();
})();
