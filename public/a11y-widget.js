/* public/a11y-widget.js */
(function () {
  'use strict';

  const KEY = 'a11y-prefs-v6'; // versión con switch y transición

  // Si el script no se cargó con "defer", esperá al DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    const $html = document.documentElement;

    // Estado persistente
    const state = Object.assign({
      zoom: 1,
      underline: false,
      contrast: false,
      pauseAnim: false,
      lineHeight: false,
      font: 'default',   // 'default' | 'legible' | 'dyslexic'
      theme: 'dark'     // 'light' | 'dark'
    }, safeParse(localStorage.getItem(KEY)));

    // Helpers
    const clamp  = (n, min, max) => Math.max(min, Math.min(max, n));
    const save   = () => localStorage.setItem(KEY, JSON.stringify(state));
    const toggle = (classes, on) => classes.split(' ').forEach(c => $html.classList[on ? 'add' : 'remove'](c));

    function setFontClass(font) {
      $html.classList.remove('a11y-font-legible', 'a11y-font-dyslexic');
      if (font === 'legible')  $html.classList.add('a11y-font-legible');
      if (font === 'dyslexic') $html.classList.add('a11y-font-dyslexic');
    }

    function applyTheme() {
      $html.classList.remove('a11y-theme-dark');
      const chk = document.getElementById('a11y-theme-toggle');
      if (state.theme === 'dark') {
        $html.classList.add('a11y-theme-dark');
        if (chk) chk.checked = true;
      } else {
        if (chk) chk.checked = false;
      }
    }

    function apply() {
      $html.style.setProperty('--a11y-zoom', Number(state.zoom) || 1);
      if (state.zoom > 1) $html.classList.add('a11y-zoom-all'); else $html.classList.remove('a11y-zoom-all');
      setFontClass(state.font);
      toggle('a11y-underline a11y-focus', !!state.underline);
      toggle('a11y-contrast',  !!state.contrast);
      toggle('a11y-pause-anim',!!state.pauseAnim);
      toggle('a11y-line',      !!state.lineHeight);
      applyTheme();
    }

    // --- UI (creación segura) ---
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
            <span id="a11y-zoom-label" style="min-width:42px;display:inline-block;text-align:center">${Math.round((Number(state.zoom)||1) * 100)}%</span>
            <button type="button" id="a11y-inc" aria-label="Aumentar texto">+</button>
          </div>
        </div>

        <div class="a11y-col" role="group" aria-labelledby="font-group-label">
          <div id="font-group-label" style="font-weight:700;">Fuente</div>
          <label><input type="radio" name="a11y-font" value="default"> Predeterminada</label>
          <label><input type="radio" name="a11y-font" value="legible"> Atkinson Hyperlegible</label>
          <label><input type="radio" name="a11y-font" value="dyslexic"> OpenDyslexic</label>
        </div>

        <div id="a11y-theme-switch">
          <span>Tema:</span>
          <label class="a11y-switch" aria-label="Cambiar tema claro/oscuro">
            <input type="checkbox" id="a11y-theme-toggle" />
            <div class="a11y-slider"><span>🌞</span><span>🌙</span></div>
          </label>
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
    // Insertar al final del body (siempre existe en Vite)
    (document.body || document.documentElement).appendChild(root);

    // Referencias (todas opcionales para evitar TypeError)
    const $panel      = document.getElementById('a11y-panel');
    const $btn        = document.getElementById('a11y-toggle');
    const $zoomLabel  = document.getElementById('a11y-zoom-label');
    const $inc        = document.getElementById('a11y-inc');
    const $dec        = document.getElementById('a11y-dec');
    const $themeTgl   = document.getElementById('a11y-theme-toggle');

    // Apertura/cierre panel
    if ($btn && $panel) {
      const setOpen = (open) => { $panel.classList.toggle('open', !!open); $btn.setAttribute('aria-expanded', String(!!open)); };
      $btn.addEventListener('click', () => setOpen(!$panel.classList.contains('open')));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }

    // Zoom listeners
    if ($inc && $zoomLabel) {
      $inc.addEventListener('click', () => {
        state.zoom = clamp((Number(state.zoom)||1) + 0.1, 1, 1.8);
        save(); apply();
        $zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
      });
    }
    if ($dec && $zoomLabel) {
      $dec.addEventListener('click', () => {
        state.zoom = clamp((Number(state.zoom)||1) - 0.1, 1, 1.8);
        save(); apply();
        $zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
      });
    }

    // Fuente (radios)
    const fontRadios = Array.from(document.querySelectorAll('input[name="a11y-font"]'));
    if (fontRadios.length) {
      fontRadios.forEach(r => {
        r.checked = (r.value === state.font);
        r.addEventListener('change', () => {
          if (r.checked) {
            state.font = r.value;
            save(); apply();
          }
        });
      });
    }

    // Tema (switch)
    if ($themeTgl) {
      $themeTgl.addEventListener('change', (e) => {
        state.theme = e.target.checked ? 'dark' : 'light';
        save(); applyTheme();
      });
    }

    // Checks
    bindCheck('a11y-underline', 'underline');
    bindCheck('a11y-contrast',  'contrast');
    bindCheck('a11y-pause',     'pauseAnim');
    bindCheck('a11y-line',      'lineHeight');

    function bindCheck(id, key) {
      const el = document.getElementById(id);
      if (!el) return;
      el.checked = !!state[key];
      el.addEventListener('change', () => { state[key] = el.checked; save(); apply(); });
    }

    // Reset
    const $reset = document.getElementById('a11y-reset');
    if ($reset) {
      $reset.addEventListener('click', () => {
        Object.assign(state, {
          zoom: 1, underline: false, contrast: false,
          pauseAnim: false, lineHeight: false, font: 'default', theme: 'light'
        });
        save(); apply();
        if ($zoomLabel) $zoomLabel.textContent = `100%`;
        fontRadios.forEach(r => { r.checked = (r.value === state.font); });
      });
    }

    // Aplicar preferencias al cargar (una vez que ya insertamos el panel)
    apply();

    // Utils
    function safeParse(s) { try { return s ? JSON.parse(s) : {}; } catch { return {}; } }
  }
})();
