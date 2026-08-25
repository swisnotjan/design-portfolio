/* site.js — shared behaviors for all pages (no framework, loads instantly) */
(function () {
  "use strict";

  var EMAIL = "hi@simonovsky.com";
  var STORE = "pf_tweaks_v1";
  var ATTRS = ["accent", "feed", "links", "cw", "personality", "bg"];
  var FONTS = {
    hanken:    '"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif',
    schibsted: '"Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif',
    system:    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'
  };
  window.PF_FONTS = FONTS;

  /* ---- apply tweak state to <html> ---- */
  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function applyTweaks(t) {
    if (!t) return;
    var root = document.documentElement, s = root.style;
    ATTRS.forEach(function (k) {
      if (t[k] != null) root.setAttribute("data-" + k, t[k]);
    });
    if (t.font && FONTS[t.font]) s.setProperty("--font", FONTS[t.font]);
    if (t.fontSize != null) s.setProperty("--fs", t.fontSize + "px");
    // bio: update lead paragraph if stored override exists
    if (t.bio && t.bio.trim()) {
      var lead = document.querySelector('.intro .lead');
      if (lead) lead.textContent = t.bio;
    }
  }
  // expose so the React panel can call it live
  window.applyTweaks = applyTweaks;
  window.__pfStore = STORE;
  // apply persisted on load (head snippet does an early pass too; this is the safety net)
  applyTweaks(readStore());

  /* ---- helpers ---- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function level() { return document.documentElement.getAttribute("data-personality") || "winks"; }

  /* ---- theme toggle (light / dark) ---- */
  function initTheme() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var sysDark = window.matchMedia("(prefers-color-scheme: dark)");

    function apply(dark) {
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    }

    // Sync aria-label with whatever pre-paint already set
    apply(document.documentElement.getAttribute("data-theme") === "dark");

    // Follow system preference when user has no stored override
    sysDark.addEventListener("change", function (e) {
      if (!localStorage.getItem("pf_theme")) apply(e.matches);
    });

    btn.addEventListener("click", function () {
      var nowDark = document.documentElement.getAttribute("data-theme") === "dark";
      // CSS cross-fade handles the icon animation automatically
      apply(!nowDark);
      localStorage.setItem("pf_theme", nowDark ? "light" : "dark");
    });
  }

  /* ---- footer face ---- */
  function initFace() {
    var el = $(".face");
    if (!el) return;

    var EYE_HOLD        = 2600;
    var COUNT_RESET_MS  = 6000;
    var HEART_THROTTLE  = 380;

    var faceState       = "idle";
    var clickCount      = 0;
    var holdTimer       = null;
    var countResetTimer = null;
    var lastHeartTime   = 0;
    var eyesAnimating   = false;
    var trackRAF        = 0;

    function le() { return el.querySelector(".bear-leye"); }
    function re() { return el.querySelector(".bear-reye"); }

    function setEyes(l, r) {
      var a = le(), b = re();
      if (!a) return;
      eyesAnimating = true;
      a.style.transform = ""; b.style.transform = "";
      a.classList.add("eye-out"); b.classList.add("eye-out");
      setTimeout(function () {
        a.textContent = l; b.textContent = r;
        a.classList.remove("eye-out"); b.classList.remove("eye-out");
        setTimeout(function () { eyesAnimating = false; }, 60);
      }, 120);
    }

    function blink() {
      if (faceState !== "idle" || eyesAnimating) return;
      var a = le(), b = re();
      if (!a) return;
      eyesAnimating = true;
      a.style.transform = ""; b.style.transform = "";
      a.textContent = "-"; b.textContent = "-";
      setTimeout(function () {
        if (faceState === "idle") { a.textContent = "•"; b.textContent = "•"; }
        eyesAnimating = false;
      }, 130);
    }

    function revertEyes() {
      var hov = el.matches && el.matches(":hover");
      if (hov) { faceState = "hover"; el.classList.add("is-hover"); }
      else     { faceState = "idle";  el.classList.remove("is-hover"); }
      setEyes("•", "•");
    }

    // 3 hearts, numeric positions for per-spawn random variation
    var HEART_CONFIGS = [
      { sz: ".56em", r: -0.50, t: -0.50, dur: 1650, wob: 520, delay:  0, dx:  0.45 },
      { sz: ".42em", r: -0.70, t: -0.60, dur: 1780, wob: 490, delay: 45, dx: -0.40 },
      { sz: ".34em", r: -0.88, t: -0.40, dur: 1950, wob: 440, delay: 90, dx:  0.20 },
    ];

    function spawnHearts() {
      // 1–3 hearts, random subset
      var count = 1 + Math.floor(Math.random() * 3);
      var pool  = HEART_CONFIGS.slice().sort(function () { return Math.random() - .5; });
      pool.slice(0, count).forEach(function (c) {
        var dur   = c.dur + (Math.random() - .5) * 320;
        var wob   = c.wob + (Math.random() - .5) * 120;
        var rise  = 2.2  + Math.random() * 1.2;
        var rot   = (Math.random() - .5) * 28;
        var rOff  = (Math.random() - .5) * 0.22;
        var tOff  = Math.random() * 0.14;
        var dxVar = c.dx + (Math.random() - .5) * 0.30;

        var outer = document.createElement("span");
        var inner = document.createElement("span");
        outer.className = "bear-heart";
        inner.className = "bear-heart-inner";
        inner.textContent = "♥";
        outer.style.cssText = "font-size:" + c.sz + ";right:" + (c.r + rOff).toFixed(2) + "em;top:" + (c.t - tOff).toFixed(2) + "em;opacity:0;transform:translateY(0)";
        inner.style.transform = "rotate(" + rot + "deg)";
        outer.appendChild(inner);
        el.appendChild(outer);

        setTimeout(function () {
          outer.style.transition = "opacity .38s ease, transform " + dur + "ms cubic-bezier(.12,.6,.4,1)";
          outer.style.opacity    = ".82";
          outer.style.transform  = "translateY(-" + rise.toFixed(2) + "em) translateX(" + dxVar.toFixed(2) + "em)";
          inner.style.animation  = "bear-wobble " + wob + "ms ease-in-out alternate infinite";
          setTimeout(function () {
            outer.style.transition = "opacity .5s ease";
            outer.style.opacity    = "0";
            setTimeout(function () { if (outer.parentNode) outer.parentNode.removeChild(outer); }, 520);
          }, dur * .65);
        }, c.delay);
      });
    }

    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      (function scheduleBlink() {
        setTimeout(function () { blink(); scheduleBlink(); }, 1600 + Math.random() * 3400);
      })();
    }

    // eye cursor tracking — subtle ±1.5px shift toward cursor
    document.addEventListener("mousemove", function (e) {
      if (eyesAnimating) return;
      var a = le(), b = re();
      if (!a || a.textContent !== "•") return;
      var rect = el.getBoundingClientRect();
      var dx = e.clientX - (rect.left + rect.width  * .5);
      var dy = e.clientY - (rect.top  + rect.height * .5);
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var f    = Math.min(dist, 160) / 160;
      var sx   = (dx / dist) * f * 1.5;
      var sy   = (dy / dist) * f * 0.5;
      cancelAnimationFrame(trackRAF);
      trackRAF = requestAnimationFrame(function () {
        if (eyesAnimating) return;
        var v = "translate(" + sx.toFixed(2) + "px," + sy.toFixed(2) + "px)";
        a.style.transform = v; b.style.transform = v;
      });
    });

    el.addEventListener("mouseenter", function () {
      if (faceState === "excited" || faceState === "love") return;
      faceState = "hover"; el.classList.add("is-hover");
    });
    el.addEventListener("mouseleave", function () {
      if (faceState === "excited" || faceState === "love") return;
      faceState = "idle"; el.classList.remove("is-hover");
    });
    el.addEventListener("click", function () {
      clearTimeout(countResetTimer);
      countResetTimer = setTimeout(function () { clickCount = 0; }, COUNT_RESET_MS);
      el.classList.remove("is-hover");
      var newState = clickCount < 2 ? "excited" : "love";
      if (faceState !== newState) {
        faceState = newState;
        setEyes(newState === "excited" ? "^" : "♥", newState === "excited" ? "^" : "♥");
      }
      if (newState === "love") {
        var now = Date.now();
        if (now - lastHeartTime > HEART_THROTTLE) { lastHeartTime = now; spawnHearts(); }
      }
      clickCount++;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(revertEyes, EYE_HOLD);
    });
  }

  /* ---- !! exclaim position tweaker ---- */
  function initExclaimTweaks() {
    var s = { top: -1.10, right: -0.70, rotate: 29 };
    var panel = document.createElement("div");
    panel.style.cssText = "position:fixed;bottom:80px;right:16px;z-index:9999;background:var(--bg,#fff);color:var(--ink,#111);border:1px solid var(--line,#e0e0e0);border-radius:10px;padding:12px 14px;font:11px/1.5 var(--font,system-ui);box-shadow:0 4px 20px rgba(0,0,0,.14);min-width:180px";
    var head = document.createElement("div");
    head.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-bottom:10px";
    var ttl = document.createElement("span");
    ttl.textContent = "!! position";
    ttl.style.cssText = "font-weight:600;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint,#aaa)";
    var cls = document.createElement("button");
    cls.textContent = "×";
    cls.style.cssText = "appearance:none;border:0;background:0;font:13px/1 inherit;cursor:pointer;color:var(--muted,#777);padding:0";
    cls.onclick = function () { document.body.removeChild(panel); };
    head.appendChild(ttl); head.appendChild(cls);
    panel.appendChild(head);
    [
      { key: "top",    label: "top (em)",    min: -2,   max: 0.5, step: 0.05 },
      { key: "right",  label: "right (em)",  min: -1.5, max: 0.5, step: 0.05 },
      { key: "rotate", label: "rotate (°)",  min: -10,  max: 90,  step: 1    },
    ].forEach(function (f) {
      var row = document.createElement("div");
      row.style.cssText = "display:flex;flex-direction:column;gap:3px;margin-bottom:9px";
      var lbl = document.createElement("div");
      lbl.style.cssText = "display:flex;justify-content:space-between;font-size:10px;color:var(--muted,#777)";
      var nm = document.createElement("span"); nm.textContent = f.label;
      var vl = document.createElement("span"); vl.textContent = s[f.key]; vl.style.fontVariantNumeric = "tabular-nums";
      lbl.appendChild(nm); lbl.appendChild(vl);
      var sl = document.createElement("input");
      sl.type = "range"; sl.min = f.min; sl.max = f.max; sl.step = f.step; sl.value = s[f.key];
      sl.style.cssText = "width:100%;cursor:pointer;accent-color:var(--ink,#111)";
      sl.addEventListener("input", function () {
        s[f.key] = parseFloat(sl.value);
        vl.textContent = s[f.key].toFixed(2);
        var ex = document.querySelector(".bear-exclaim");
        if (ex) { ex.style.top = s.top + "em"; ex.style.right = s.right + "em"; ex.style.transform = "rotate(" + s.rotate + "deg)"; }
      });
      row.appendChild(lbl); row.appendChild(sl);
      panel.appendChild(row);
    });
    document.body.appendChild(panel);
  }

  /* ---- footer signature: draw when scrolled into view ---- */
  function initSignature() {
    var sig = $(".sig");
    if (!sig) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { sig.classList.add("drawn"); return; }
    function check() {
      var r = sig.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * 0.92 && r.bottom > 0) {
        sig.classList.add("drawn");
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
        return true;
      }
      return false;
    }
    if (!check()) {
      window.addEventListener("scroll", check, { passive: true });
      window.addEventListener("resize", check);
    }
  }

  /* ---- reveal on load (staggered) ---- */
  function initReveal() {
    var els = $all(".reveal");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    els.forEach(function (el, i) {
      var d = parseFloat(el.getAttribute("data-delay")) || (i * 70);
      setTimeout(function () { el.classList.add("in"); }, 90 + d);
    });
  }

  /* ---- load videos near the viewport; play only while visible ---- */
  function initVideos() {
    var videos = $all("video");
    if (!videos.length) return;

    function load(video) {
      if (video.getAttribute("data-loaded") === "true") return;
      $all("source[data-src]", video).forEach(function (source) {
        source.src = source.getAttribute("data-src");
        source.removeAttribute("data-src");
      });
      video.setAttribute("data-loaded", "true");
      video.load();
    }

    function play(video) {
      load(video);
      var promise = video.play();
      if (promise && promise.catch) promise.catch(function () {});
    }

    if (!("IntersectionObserver" in window)) {
      videos.forEach(play);
      return;
    }

    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var constrainedConnection = connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ""));
    var loadMargin = constrainedConnection ? "0px" :
      (matchMedia("(max-width: 720px)").matches ? "120px 0px" : "300px 0px");

    var loadObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        load(entry.target);
        loadObserver.unobserve(entry.target);
      });
    }, { rootMargin: loadMargin, threshold: 0 });

    var playObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) play(entry.target);
        else entry.target.pause();
      });
    }, { threshold: 0.08 });

    videos.forEach(function (video) {
      loadObserver.observe(video);
      playObserver.observe(video);
    });
  }

  /* ---- boot ---- */
  function boot() {
    initTheme();
    initFace();
    initSignature();
    initReveal();
    initVideos();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
