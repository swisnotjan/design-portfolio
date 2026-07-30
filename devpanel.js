/* DEV ONLY — floating column-width panel */
(function () {
  var KEY = 'pf_tweaks_v1';
  var MIN = 320, MAX = 760, STEP = 4, DEFAULT = 480;

  function stored() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }

  function applyCol(val) {
    val = Math.round(Math.max(MIN, Math.min(MAX, parseInt(val, 10))) / STEP) * STEP;
    if (isNaN(val)) return null;
    document.documentElement.style.setProperty('--col', val + 'px');
    try {
      var t = stored();
      t.colWidth = val;
      localStorage.setItem(KEY, JSON.stringify(t));
    } catch (e) {}
    return val;
  }

  /* apply stored value immediately — before DOM, no flash */
  var t = stored();
  if (t.colWidth) document.documentElement.style.setProperty('--col', t.colWidth + 'px');

  document.addEventListener('DOMContentLoaded', function () {
    var current = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--col')) || DEFAULT;

    var panel = document.createElement('div');
    panel.style.cssText = [
      'position:fixed', 'bottom:20px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'display:flex', 'align-items:center', 'gap:10px',
      'padding:9px 14px', 'border-radius:999px',
      'background:var(--bg)', 'border:1px solid var(--line)',
      'box-shadow:0 4px 24px -4px rgba(0,0,0,.12)',
      'font-family:var(--font)', 'font-size:12px', 'color:var(--muted)',
      'user-select:none', 'white-space:nowrap'
    ].join(';');

    var label = document.createElement('span');
    label.textContent = '↔';
    label.style.cssText = 'opacity:.5;';

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = MIN; slider.max = MAX; slider.step = STEP;
    slider.value = current;
    slider.style.cssText = 'width:120px;cursor:pointer;accent-color:var(--ink);margin:0;';

    var numInput = document.createElement('input');
    numInput.type = 'text';
    numInput.inputMode = 'numeric';
    numInput.value = current;
    numInput.style.cssText = [
      'width:50px', 'border:1px solid var(--line)', 'border-radius:6px',
      'padding:3px 6px', 'font:inherit', 'color:var(--ink)',
      'background:var(--bg)', 'text-align:right', 'outline:none'
    ].join(';');

    var suffix = document.createElement('span');
    suffix.textContent = 'px';
    suffix.style.cssText = 'opacity:.5;margin-left:-4px;';

    function sync(val) {
      var v = applyCol(val);
      if (v !== null) { slider.value = v; numInput.value = v; }
    }

    function commitInput() { sync(numInput.value); }

    /* slider: live update while dragging */
    slider.addEventListener('input', function () { sync(slider.value); });

    /* text input: commit on Enter or blur; arrows step by STEP */
    numInput.addEventListener('blur', commitInput);
    numInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commitInput(); numInput.blur(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); numInput.value = (parseInt(numInput.value, 10) || 0) + STEP; commitInput(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); numInput.value = (parseInt(numInput.value, 10) || 0) - STEP; commitInput(); }
    });

    panel.appendChild(label);
    panel.appendChild(slider);
    panel.appendChild(numInput);
    panel.appendChild(suffix);
    document.body.appendChild(panel);
  });
})();
