/* Page-local translations: switch text without navigating or restarting media. */
(function () {
  'use strict';
  var payload = document.getElementById('translations');
  if (!payload) return;
  var translations = JSON.parse(payload.textContent);
  var button = document.getElementById('language-toggle');
  var textEntries = Object.keys(translations.text).map(function (key) {
    return { el: document.querySelector('[data-i18n="' + key + '"]'), text: translations.text[key] };
  });
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var switching = false;
  var buttonLabel = document.createElement('span');
  buttonLabel.className = 'language-label';
  button.replaceChildren(buttonLabel);
  function visibleText() {
    var nodes = [];
    var targets = textEntries.map(function (entry) { return entry.el; });
    targets.push(document.getElementById('foot-copy'), document.getElementById('copy-btn'));
    targets.filter(Boolean).forEach(function (el) {
      var candidates = getComputedStyle(el).display === 'contents' ? Array.from(el.children) : [el];
      candidates.forEach(function (node) {
        var rect = node.getBoundingClientRect();
        if (rect.width && rect.bottom > 0 && rect.top < innerHeight) nodes.push(node);
      });
    });
    return nodes;
  }
  function animate(nodes, frames, duration) {
    return Promise.all(nodes.map(function (node) {
      return node.animate(frames, { duration: duration, easing: 'cubic-bezier(.32,.72,.32,1)' }).finished.catch(function () {});
    }));
  }
  function mediaPositions() {
    return Array.from(document.querySelectorAll('.media, .cs-hero, .thumb, main figure, .popup-playground')).map(function (el) {
      return { el: el, rect: el.getBoundingClientRect() };
    });
  }
  function moveMedia(previous) {
    return Promise.all(previous.map(function (item) {
      var rect = item.el.getBoundingClientRect();
      var delta = item.rect.top - rect.top;
      var wasVisible = item.rect.bottom > 0 && item.rect.top < innerHeight;
      var isVisible = rect.bottom > 0 && rect.top < innerHeight;
      if (Math.abs(delta) < 1 || (!wasVisible && !isVisible)) return;
      // Keep existing transforms, including the hero's horizontal centering.
      var transform = getComputedStyle(item.el).transform;
      var base = transform === 'none' ? '' : ' ' + transform;
      return animate([item.el], [
        { transform: 'translateY(' + delta + 'px)' + base },
        { transform: 'translateY(0)' + base }
      ], 320);
    }));
  }
  function apply(language) {
    var anchor = textEntries.map(function (entry) { return entry.el; }).find(function (el) {
      var first = el.classList.contains('case-copy') ? el.firstElementChild : el;
      var last = el.classList.contains('case-copy') ? el.lastElementChild : el;
      return first && last && last.getBoundingClientRect().bottom > 0 && first.getBoundingClientRect().top < innerHeight;
    });
    function anchorTop() {
      var el = anchor && (anchor.classList.contains('case-copy') ? anchor.firstElementChild : anchor);
      return el ? el.getBoundingClientRect().top : 0;
    }
    var top = anchorTop();
    document.documentElement.lang = language;
    textEntries.forEach(function (entry) {
      entry.el.innerHTML = entry.text[language];
    });
    translations.attrs.forEach(function (item) {
      var el = document.querySelector('[data-i18n-attr="' + item.key + '"]');
      if (el) el.setAttribute(item.attr, item[language]);
    });
    translations.meta.forEach(function (item) {
      var el = document.querySelector(item.selector);
      if (el) el.setAttribute('content', item[language]);
    });
    document.title = translations.title[language];
    buttonLabel.textContent = language === 'ru' ? 'EN' : 'RU';
    button.setAttribute('aria-label', language === 'ru' ? 'Switch to English' : 'Переключить на русский');
    button.lang = language === 'ru' ? 'en' : 'ru';
    try { localStorage.setItem('pf_language', language); } catch (e) {}
    document.dispatchEvent(new CustomEvent('portfolio:language-changed'));
    if (anchor && window.scrollY > 0) window.scrollBy(0, anchorTop() - top);
  }
  var language = 'ru';
  try { language = localStorage.getItem('pf_language') || 'ru'; } catch (e) {}
  var requested = new URLSearchParams(location.search).get('lang');
  if (requested === 'en' || requested === 'ru') language = requested;
  apply(language === 'en' ? 'en' : 'ru');
  button.addEventListener('click', async function () {
    if (switching) return;
    switching = true;
    button.setAttribute('aria-busy', 'true');
    var next = document.documentElement.lang === 'ru' ? 'en' : 'ru';
    var motion = !reducedMotion.matches && typeof button.animate === 'function';
    try {
      if (motion) {
        await Promise.all([
          animate(visibleText(), [{ opacity: 1 }, { opacity: 0 }], 90),
          animate([buttonLabel], [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(-4px) scale(.9)' }], 90)
        ]);
      }
      var previousMedia = motion ? mediaPositions() : [];
      apply(next);
      var url = new URL(location.href);
      url.searchParams.set('lang', next);
      history.replaceState(null, '', url);
      if (motion) {
        await Promise.all([
          moveMedia(previousMedia),
          animate(visibleText(), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 320),
          animate([buttonLabel], [{ opacity: 0, transform: 'translateY(4px) scale(.9)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 180)
        ]);
      }
    } finally {
      switching = false;
      button.removeAttribute('aria-busy');
    }
  });
})();
