/* Whiteboard = single source of notes. Quick Notes shows them as tasks,
   and Today's Progress is calculated from the completed tasks. */
(function () {
  'use strict';
  var KEY_TEXT = 'tayassuk-os-whiteboard';          // existing Whiteboard storage
  var KEY_DONE = 'tayassuk-os-notes-done';          // completion flags
  var KEY_SEED = 'tayassuk-os-notes-seeded';
  var DEFAULTS = ['Finish SE-223 project', 'Practice DSA problems', 'Work on next project', 'Learn React'];

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function readDone() { try { return JSON.parse(get(KEY_DONE)) || {}; } catch (e) { return {}; } }

  /* First run only: keep the original Quick Notes content by putting it in the Whiteboard */
  if (get(KEY_TEXT) === null && !get(KEY_SEED)) {
    set(KEY_TEXT, DEFAULTS.join('\n'));
    var d = {}; d[keyFor(DEFAULTS[0], 0, DEFAULTS)] = true; d[keyFor(DEFAULTS[1], 0, DEFAULTS)] = true;
    set(KEY_DONE, JSON.stringify(d));
  }
  set(KEY_SEED, '1');

  function keyFor(text, _i, lines) {            // "text#n" so duplicate lines keep separate flags
    var n = 0; for (var i = 0; i < lines.length; i++) { if (lines[i] === text) { n++; if (i >= _i) break; } }
    return text + '#' + n;
  }
  function lineList(raw) { return (raw || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean); }
  function notes() {
    var lines = lineList(get(KEY_TEXT)), done = readDone(), seen = {};
    return lines.map(function (t) { seen[t] = (seen[t] || 0) + 1; var k = t + '#' + seen[t]; return { text: t, key: k, done: !!done[k] }; });
  }
  function save(list, doneMap) {
    set(KEY_TEXT, list.map(function (n) { return n.text; }).join('\n'));
    set(KEY_DONE, JSON.stringify(doneMap));
    var ta = document.getElementById('whiteboard-input');          // keep an open Whiteboard in step
    if (ta) ta.value = list.map(function (n) { return n.text; }).join('\n');
  }
  function doneMapOf(list) { var m = {}; list.forEach(function (n) { if (n.done) m[n.key] = true; }); return m; }

  /* ---------- actions ---------- */
  function toggle(i) { var l = notes(); if (!l[i]) return; l[i].done = !l[i].done; save(l, doneMapOf(l)); render(); }
  function edit(i, text) {
    text = (text || '').replace(/\s+/g, ' ').trim();
    var l = notes(); if (!l[i]) return;
    if (!text) return remove(i);
    var was = l[i].done; l[i].text = text; l[i].done = false;
    var m = doneMapOf(l); l = lineList(l.map(function (n) { return n.text; }).join('\n'));
    // re-derive keys after the edit, carry the flag over to the edited line
    var after = notes_from(l, i, was, m); save(after.list, after.done); render();
  }
  function notes_from(lines, editedIdx, wasDone, oldMap) {
    var seen = {}, list = lines.map(function (t, idx) {
      seen[t] = (seen[t] || 0) + 1; var k = t + '#' + seen[t];
      return { text: t, key: k, done: idx === editedIdx ? wasDone : !!oldMap[k] };
    });
    return { list: list, done: doneMapOf(list) };
  }
  function remove(i) { var l = notes(); l.splice(i, 1); var lines = l.map(function (n) { return n.text; });
    var seen = {}, map = {}; l.forEach(function (n) { seen[n.text] = (seen[n.text] || 0) + 1; if (n.done) map[n.text + '#' + seen[n.text]] = true; });
    save(l, map); render(); }

  /* ---------- rendering ---------- */
  var esc = function (v) { return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var editing = -1;
  function render() {
    var list = notes(), ul = document.getElementById('quick-notes-list');
    var total = list.length, completed = list.filter(function (n) { return n.done; }).length;
    if (ul && editing < 0) {
      ul.innerHTML = total ? list.map(function (n, i) {
        return '<li class="qn-item' + (n.done ? ' is-done' : '') + '" data-i="' + i + '">' +
          '<input type="checkbox" class="qn-check" aria-label="Mark complete: ' + esc(n.text) + '"' + (n.done ? ' checked' : '') + '>' +
          '<span class="qn-text" title="' + esc(n.text) + '">' + esc(n.text) + '</span>' +
          '<button type="button" class="qn-btn" data-qn="edit" aria-label="Edit note" title="Edit"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button>' +
          '<button type="button" class="qn-btn" data-qn="delete" aria-label="Delete note" title="Delete"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></li>';
      }).join('') : '<li class="qn-empty">No notes yet. Write one in the Whiteboard.</li>';
    }
    var cnt = document.getElementById('qn-count'); if (cnt) cnt.textContent = total ? completed + '/' + total : '';
    var pct = total ? Math.round(completed / total * 100) : 0;       // Completed / Total x 100
    var bar = document.getElementById('hero-progress'); if (bar) bar.style.width = pct + '%';
    var p = document.getElementById('hero-progress-pct'); if (p) p.textContent = pct + '%';
    var c = document.getElementById('hero-progress-count'); if (c) c.textContent = completed + '/' + total;
  }

  /* ---------- events ---------- */
  document.addEventListener('change', function (e) {
    var cb = e.target.closest && e.target.closest('.qn-check'); if (!cb) return;
    toggle(+cb.closest('.qn-item').dataset.i);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-qn]'); if (!b) return;
    var li = b.closest('.qn-item'), i = +li.dataset.i;
    if (b.dataset.qn === 'delete') return remove(i);
    editing = i; var span = li.querySelector('.qn-text'), cur = notes()[i].text;
    var inp = document.createElement('input'); inp.type = 'text'; inp.className = 'qn-input'; inp.value = cur; inp.maxLength = 120;
    span.replaceWith(inp); inp.focus(); inp.select();
    var finished = false;
    function done(commit) { if (finished) return; finished = true; editing = -1; if (commit) edit(i, inp.value); else render(); }
    inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') done(true); else if (ev.key === 'Escape') { ev.stopPropagation(); done(false); } });
    inp.addEventListener('blur', function () { done(true); });
  });
  document.addEventListener('input', function (e) {                    // Whiteboard typing -> instant sync
    if (e.target && e.target.id === 'whiteboard-input') { set(KEY_TEXT, e.target.value); render(); }
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY_TEXT || e.key === KEY_DONE) render(); });

  render();
})();
