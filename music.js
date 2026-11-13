/* Tayassuk OS — Music player (HTML5 Audio). Playback starts only on user click. */
(function () {
  'use strict';
  var TRACKS = [
    { title: 'So Far Away (Acoustic)', src: './assets/music/so-far-away-acoustic.mp3' },
    { title: 'At My Worst', src: './assets/music/at-my-worst.mp3' },
    { title: 'Eenie Meenie', src: './assets/music/eenie-meenie.mp3' }
  ];
  var $ = function (id) { return document.getElementById(id); };
  var audio = $('music-audio'), card = $('music-player');
  if (!audio || !card) return;
  var el = {
    title: $('music-title'), status: $('music-status'), bar: $('music-progress'), fill: $('music-progress-fill'),
    cur: $('music-current'), dur: $('music-duration'), prev: $('music-prev'), play: $('music-play'),
    next: $('music-next'), vol: $('music-volume')
  };
  var PLAY = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  var index = 0, failed = {};

  function fmt(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function setStatus(txt) { el.status.textContent = 'Lo-Fi Coding · ' + txt; }
  function paintPlaying(on) {
    card.classList.toggle('is-playing', on);
    el.play.innerHTML = on ? PAUSE : PLAY;
    el.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
    el.play.title = on ? 'Pause' : 'Play';
  }
  function load(i, autoplay) {
    index = (i + TRACKS.length) % TRACKS.length;
    el.title.textContent = TRACKS[index].title;
    el.title.title = TRACKS[index].title;
    audio.src = new URL(TRACKS[index].src, document.baseURI).href;
    audio.load();
    el.fill.style.width = '0%';
    el.cur.textContent = '0:00';
    el.dur.textContent = '0:00';
    setStatus(autoplay ? 'Loading…' : 'Paused');
    if (autoplay) attemptPlay();
  }
  function attemptPlay() {
    var p = audio.play();
    if (p && p.catch) p.catch(function (err) {
      if (err && err.name === 'NotAllowedError') { setStatus('Tap play'); paintPlaying(false); }
    });
  }
  function toggle() {
    if (audio.paused) {
      if (!audio.src) load(index, true); else attemptPlay();
    } else audio.pause();
  }
  function step(dir) {
    var was = !audio.paused || card.classList.contains('is-playing');
    load(index + dir, was);
  }

  audio.addEventListener('play', function () { paintPlaying(true); setStatus('Playing'); });
  audio.addEventListener('playing', function () { setStatus('Playing'); });
  audio.addEventListener('pause', function () { if (!audio.ended) { paintPlaying(false); setStatus('Paused'); } });
  audio.addEventListener('waiting', function () { setStatus('Buffering…'); });
  audio.addEventListener('canplay', function () { if (audio.paused) setStatus('Paused'); });
  audio.addEventListener('loadedmetadata', function () { el.dur.textContent = fmt(audio.duration); });
  audio.addEventListener('durationchange', function () { el.dur.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', function () {
    var d = audio.duration, t = audio.currentTime;
    el.cur.textContent = fmt(t);
    if (d > 0) {
      var pct = (t / d) * 100;
      el.fill.style.width = pct + '%';
      el.bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
  });
  audio.addEventListener('ended', function () { load(index + 1, true); });
  audio.addEventListener('error', function () {
    failed[index] = true;
    paintPlaying(false);
    setStatus('Track unavailable');
    console.error('Tayassuk OS music: audio file could not be loaded.', { track: TRACKS[index].src, source: audio.currentSrc, code: audio.error && audio.error.code });
    if (Object.keys(failed).length < TRACKS.length && card.dataset.wantPlay === '1') load(index + 1, true);
  });

  el.play.addEventListener('click', function () { card.dataset.wantPlay = '1'; toggle(); });
  el.next.addEventListener('click', function () { step(1); });
  el.prev.addEventListener('click', function () {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }   // restart, like most players
    step(-1);
  });

  /* Seeking: click / drag / touch / keyboard */
  var seeking = false;
  function seekFrom(e) {
    var r = el.bar.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    var pct = Math.min(1, Math.max(0, x / r.width));
    if (audio.duration > 0) { audio.currentTime = pct * audio.duration; el.fill.style.width = (pct * 100) + '%'; }
  }
  el.bar.addEventListener('pointerdown', function (e) { seeking = true; el.bar.setPointerCapture(e.pointerId); seekFrom(e); });
  el.bar.addEventListener('pointermove', function (e) { if (seeking) seekFrom(e); });
  el.bar.addEventListener('pointerup', function () { seeking = false; });
  el.bar.addEventListener('pointercancel', function () { seeking = false; });
  el.bar.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
    else if (e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
  });

  /* Volume (remembered) */
  var saved = 70;
  try { var v = parseInt(localStorage.getItem('tayassuk-os-music-volume'), 10); if (!isNaN(v)) saved = Math.min(100, Math.max(0, v)); } catch (e) {}
  el.vol.value = saved; audio.volume = saved / 100;
  el.vol.addEventListener('input', function () {
    audio.volume = el.vol.value / 100;
    try { localStorage.setItem('tayassuk-os-music-volume', el.vol.value); } catch (e) {}
  });

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', function () { attemptPlay(); });
    navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
    navigator.mediaSession.setActionHandler('previoustrack', function () { step(-1); });
    navigator.mediaSession.setActionHandler('nexttrack', function () { step(1); });
  }

  load(0, false);
  paintPlaying(false);
})();
