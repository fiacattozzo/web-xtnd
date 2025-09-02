(function () {
  const KEY = 'a11y-prefs-v3'; // subimos versión por el nuevo 'theme'
  const $html = document.documentElement;

  const state = Object.assign({
    zoom: 1,
    underline: false,
    contrast: false,
    pauseAnim: false,
    lineHeight: false,
    font: 'default',   // 'default' | 'legible' | 'dyslexic'
    theme: 'auto'      // 'auto' | 'light' | 'dark'
  }, JSON.parse(localStorage.getItem(KEY) || '{}'));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const save  = () => localStorage.setItem(KEY, JSON.stringify(state));
  const toggle = (classes, on) => classes.split(' ').forEach(c => $html.classList[on ? 'add' : 'remove'](c));

  // Tema: auto sigue al SO (prefers-color-scheme)
  const mqlDark = window.matchMedia?.('(prefers-color-scheme: dark)');
  function applyTheme() {
    $html.classList.remove('a11y-theme-dark');
    if (state.theme === 'dark' || (state.theme === 'auto' && mqlDark?.matches)) {
      $html.classList.add('a11y-theme-dark');
    }
    // (No necesitamos clase para claro: es el estado base)
  }
  mqlDark && mqlDark.addEventListener('change', () => {
    if (state.theme === 'auto') applyTheme();
  });

  function setFontClass(font) {
    $html.classList.remove('a11y-font-legible', 'a11y-font-dyslexic');
    if (font === 'legible') $html.classList.add('a11y-font-legible');
    if (font === 'dyslexic') $html.classList.add('a11y-font-dyslexic');
  }

  function apply() {
    $html.style.setProperty('--a11y-zoom', state.zoom);
    if (state.zoom > 1) $html.classList.add('a11y-zoom-all'); else $html.classList.remove('a11y-zoom-all');
    setFontClass(state.font);
    toggle('a11y-underline a11y-focus', state.underline);
    toggle('a11y-contrast', state.contrast);
    toggle('a11y-pause-anim', state.pauseAnim);
    toggle('a11y-line', state.lineHeight);
    applyTheme();
  }

  // --- UI ---
  const root = document.createElement('div');
  root.id = 'a11y-widget';
  root.innerHTML = `
    <button id="a11y-toggle" aria-haspopup="dialog" aria-controls="a11y-panel" aria-expanded="false" title="Accesibilidad">♿</button>
    <div id="a11y-panel" role="dialog" aria-label="Opciones de accesibilidad">
      <h3>Accesibilidad</h3>

      <div class="a11y-row">
        <span>Tamaño de texto</span>
        <div class="a11y-pill">
          <button type="button" id="a11y-dec" aria-label="Reducir texto">–</button>
          <span id="a11y-zoom-label" style="min-width:42px;display:inline-block;text-align:center">${Math.round(state.zoom * 100)}%</span>
          <button type="button" id="a11y-inc" aria-label="Aumentar texto">+</button>
        </div>
      </div>

      <div class="a11y-col" role="group" aria-labelledby="font-group-label">
        <div id="font-group-label" style="font-weight:700;">Fuente</div>
        <label><input type="radio" name="a11y-font" value="default"> Predeterminada</label>
        <label><input type="radio" name="a11y-font" value="legible"> Atkinson Hyperlegible</label>
        <label><input type="radio" name="a11y-font" value="dyslexic"> OpenDyslexic</label>
      </div>

      <div class="a11y-col" role="group" aria-labelledby="theme-group-label" style="margin-top:6px;">
        <div id="theme-group-label" style="font-weight:700;">Tema</div>
        <label><input type="radio" name="a11y-theme" value="auto"> Automático (SO)</label>
        <label><input type="radio" name="a11y-theme" value="light"> Claro</label>
        <label><input type="radio" name="a11y-theme" value="dark"> Oscuro</label>
      </div>

      <div class="a11y-row">
        <label><input type="checkbox" id="a11y-underline"> Subrayar enlaces</label>
        <label><input type="checkbox" id="a11y-contrast"> Alto contraste</label>
      </div>

      <div class="a11y-row">
        <label><input type="checkbox" id="a11y-pause"> Pausar animaciones</label>
        <label><input type="checkbox" id="a11y-line"> + Interlineado</label>
      </div>

      <button id="a11y-reset" type="button" title="Restaurar">Restablecer</button>
      <p class="a11y-note">Preferencias guardadas en este navegador.</p>
    </div>`;
  document.body.appendChild(root);

  // Abrir/cerrar panel
  const $panel = document.getElementById('a11y-panel');
  const $btn = document.getElementById('a11y-toggle');
  const setOpen = (open) => { $panel.classList.toggle('open', open); $btn.setAttribute('aria-expanded', String(open)); };
  $btn.addEventListener('click', () => setOpen(!$panel.classList.contains('open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Zoom
  const $zoomLabel = document.getElementById('a11y-zoom-label');
  document.getElementById('a11y-inc').onclick = () => { state.zoom = clamp(state.zoom + 0.1, 1, 1.8); save(); apply(); $zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`; };
  document.getElementById('a11y-dec').onclick = () => { state.zoom = clamp(state.zoom - 0.1, 1, 1.8); save(); apply(); $zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`; };

  // Fuente
  const fontRadios = Array.from(document.querySelectorAll('input[name="a11y-font"]'));
  fontRadios.forEach(r => {
    r.checked = (r.value === state.font);
    r.addEventListener('change', () => { if (r.checked) { state.font = r.value; save(); apply(); } });
  });

  // Tema
  const themeRadios = Array.from(document.querySelectorAll('input[name="a11y-theme"]'));
  themeRadios.forEach(r => {
    r.checked = (r.value === state.theme);
    r.addEventListener('change', () => { if (r.checked) { state.theme = r.value; save(); applyTheme(); } });
  });

  // Checks
  bindCheck('a11y-underline', 'underline');
  bindCheck('a11y-contrast',  'contrast');
  bindCheck('a11y-pause',     'pauseAnim');
  bindCheck('a11y-line',      'lineHeight');
  function bindCheck(id, key) {
    const el = document.getElementById(id);
    el.checked = !!state[key];
    el.onchange = () => { state[key] = el.checked; save(); apply(); };
  }

  // Reset
  document.getElementById('a11y-reset').onclick = () => {
    Object.assign(state, { zoom: 1, underline: false, contrast: false, pauseAnim: false, lineHeight: false, font: 'default', theme: 'auto' });
    save(); apply();
    $zoomLabel.textContent = `100%`;
    fontRadios.forEach(r => { r.checked = (r.value === state.font); });
    themeRadios.forEach(r => { r.checked = (r.value === state.theme); });
  };

  // Aplicar preferencias al cargar
  apply();
})();
