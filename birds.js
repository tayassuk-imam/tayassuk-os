/* Tayassuk OS — lightweight distant bird silhouettes */
(() => {
  const mountBirds = () => {
    const desktop = document.querySelector('.desktop');
    if (!desktop || desktop.querySelector('.tayassuk-birds')) return;

    const layer = document.createElement('div');
    layer.className = 'tayassuk-birds';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `
      <svg viewBox="0 0 180 54" role="presentation" focusable="false">
        <g class="bird bird-one">
          <path class="wing wing-left" d="M0 13 C-8 4 -17 1 -25 4 C-16 7 -10 12 0 17Z"/>
          <path class="wing wing-right" d="M0 13 C8 4 17 1 25 4 C16 7 10 12 0 17Z"/>
          <path d="M-2 14 Q0 11 2 14 L1 20 L-1 20Z"/>
        </g>
        <g class="bird bird-two">
          <path class="wing wing-left" d="M0 10 C-6 3 -13 1 -20 3 C-12 6 -7 10 0 14Z"/>
          <path class="wing wing-right" d="M0 10 C6 3 13 1 20 3 C12 6 7 10 0 14Z"/>
          <path d="M-2 11 Q0 9 2 11 L1 16 L-1 16Z"/>
        </g>
        <g class="bird bird-three">
          <path class="wing wing-left" d="M0 8 C-5 2 -10 1 -16 2 C-10 5 -5 8 0 11Z"/>
          <path class="wing wing-right" d="M0 8 C5 2 10 1 16 2 C10 5 5 8 0 11Z"/>
          <path d="M-1.5 9 Q0 7 1.5 9 L1 13 L-1 13Z"/>
        </g>
      </svg>`;
    desktop.appendChild(layer);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountBirds, { once: true });
  } else {
    mountBirds();
  }
})();
