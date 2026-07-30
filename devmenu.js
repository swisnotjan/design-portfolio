/* ── DEV MENU (temporary) ────────────────────────────────────────────── */
(function () {
  /* ---- styles ---- */
  var style = document.createElement("style");
  style.textContent = [
    "#dev-menu {",
    "  position: fixed; bottom: 24px; right: 24px; z-index: 9999;",
    "  font-family: ui-monospace, 'SF Mono', monospace; font-size: 11px;",
    "  user-select: none;",
    "}",
    "#dev-panel {",
    "  background: #fff; border: 1px solid #d0d0d0;",
    "  border-radius: 10px; padding: 14px 16px 16px;",
    "  box-shadow: 0 4px 24px rgba(0,0,0,.12);",
    "  width: 230px; margin-bottom: 8px;",
    "  display: none;",
    "}",
    "#dev-panel.open { display: block; }",
    "#dev-toggle {",
    "  display: block; margin-left: auto;",
    "  background: #111; color: #fff; border: none;",
    "  border-radius: 6px; padding: 6px 12px;",
    "  font: inherit; font-size: 11px; cursor: pointer; letter-spacing: .04em;",
    "}",
    ".dev-section { margin-bottom: 14px; }",
    ".dev-section:last-child { margin-bottom: 0; }",
    ".dev-label {",
    "  color: #999; text-transform: uppercase; letter-spacing: .08em;",
    "  font-size: 9.5px; margin-bottom: 8px; display: block;",
    "}",
    ".dev-slider { width: 100%; accent-color: #111; cursor: pointer; }",
    ".dev-val { float: right; color: #111; font-size: 10.5px; }",
    ".dev-case-list { display: flex; flex-direction: column; gap: 4px; }",
    ".dev-case-row {",
    "  display: flex; align-items: center; gap: 6px;",
    "  background: #f5f5f5; border-radius: 5px; padding: 5px 8px;",
    "}",
    ".dev-case-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #111; }",
    ".dev-btn-mv {",
    "  background: none; border: 1px solid #d0d0d0;",
    "  border-radius: 3px; width: 20px; height: 20px;",
    "  display: flex; align-items: center; justify-content: center;",
    "  cursor: pointer; color: #555; flex-shrink: 0; font-size: 11px; line-height: 1;",
    "}",
    ".dev-btn-mv:hover { background: #eee; }",
    ".dev-btn-mv:disabled { opacity: .25; cursor: default; }",
  ].join("\n");
  document.head.appendChild(style);

  /* ---- markup ---- */
  var menu = document.createElement("div");
  menu.id = "dev-menu";
  menu.innerHTML = [
    '<div id="dev-panel">',

    '  <div class="dev-section">',
    '    <span class="dev-label">Thumbnail width <span class="dev-val" id="dev-w-disp">100%</span></span>',
    '    <input class="dev-slider" id="dev-w-slider" type="range" min="30" max="100" step="1" value="100" />',
    '  </div>',

    '  <div class="dev-section">',
    '    <span class="dev-label">Case order</span>',
    '    <div class="dev-case-list" id="dev-case-list"></div>',
    '  </div>',

    '</div>',
    '<button id="dev-toggle">DEV ⚙</button>',
  ].join("");
  document.body.appendChild(menu);

  /* ---- toggle ---- */
  var panel  = document.getElementById("dev-panel");
  var togBtn = document.getElementById("dev-toggle");
  togBtn.addEventListener("click", function () { panel.classList.toggle("open"); });

  /* ---- thumbnail width slider ---- */
  var wSlider = document.getElementById("dev-w-slider");
  var wDisp   = document.getElementById("dev-w-disp");

  function applyWidth(val) {
    document.documentElement.style.setProperty("--thumb-max-w", val + "%");
    wDisp.textContent = val + "%";
  }

  wSlider.addEventListener("input", function () { applyWidth(+this.value); });
  applyWidth(100);

  /* ---- case reorder ---- */
  var feed = document.querySelector(".feed");

  function buildCaseList() {
    var list  = document.getElementById("dev-case-list");
    list.innerHTML = "";
    var cases = Array.from(feed ? feed.children : []);
    cases.forEach(function (el, i) {
      var titleEl = el.querySelector(".case-title") || el.querySelector(".case-desc");
      var title = titleEl
        ? titleEl.textContent.trim().replace(/[→↗]/g, "").trim()
        : "Case " + (i + 1);

      var row = document.createElement("div");
      row.className = "dev-case-row";

      var up = document.createElement("button");
      up.className = "dev-btn-mv"; up.textContent = "↑";
      if (i === 0) up.disabled = true;
      up.addEventListener("click", function () {
        var prev = el.previousElementSibling;
        if (prev) { feed.insertBefore(el, prev); buildCaseList(); }
      });

      var dn = document.createElement("button");
      dn.className = "dev-btn-mv"; dn.textContent = "↓";
      if (i === cases.length - 1) dn.disabled = true;
      dn.addEventListener("click", function () {
        var next = el.nextElementSibling;
        if (next) { feed.insertBefore(next, el); buildCaseList(); }
      });

      var name = document.createElement("span");
      name.className = "dev-case-name"; name.textContent = title;

      row.appendChild(up);
      row.appendChild(dn);
      row.appendChild(name);
      list.appendChild(row);
    });
  }

  togBtn.addEventListener("click", function () {
    if (panel.classList.contains("open")) buildCaseList();
  });

  buildCaseList();
})();
