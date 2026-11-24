/* Page-local translations: switch text without navigating or restarting media. */
(function () {
  'use strict';
  var payload = document.getElementById('translations');
  if (!payload) return;
  var translations = JSON.parse(payload.textContent);
  var button = document.getElementById('language-toggle');
  var canonical = document.querySelector('link[rel="canonical"]');
  var route = new URL(canonical.href).pathname.replace(/^\/(?:en|ru)(?=\/|$)/, '') || '/';
  var ogURL = document.querySelector('meta[property="og:url"]');
  var markdown = document.querySelector('link[rel="alternate"][type="text/markdown"]');
  if (!markdown) {
    markdown = document.createElement('link');
    markdown.rel = 'alternate';
    markdown.type = 'text/markdown';
    markdown.href = translations.markdown;
  }
  var textEntries = Object.keys(translations.text).map(function (key) {
    return { el: document.querySelector('[data-i18n="' + key + '"]'), text: translations.text[key] };
  });
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var switching = false;
  var lastSwitch;
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
  function anchorBounds(block) {
    var first = block.classList.contains('case-copy') ? block.firstElementChild : block;
    var last = block.classList.contains('case-copy') ? block.lastElementChild : block;
    if (!first || !last) return null;
    var start = first.getBoundingClientRect();
    var end = last === first ? start : last.getBoundingClientRect();
    var height = end.bottom - start.top;
    return start.width && height > 0 ? { top: start.top, bottom: end.bottom, height: height } : null;
  }
  function apply(language) {
    var scrollY = window.scrollY;
    var previousLanguage = document.documentElement.lang;
    // A second toggle at the same spot should undo the previous scroll adjustment.
    var returning = lastSwitch && lastSwitch.from === language &&
      lastSwitch.to === previousLanguage && lastSwitch.width === innerWidth &&
      lastSwitch.height === innerHeight && Math.abs(lastSwitch.end - scrollY) <= 1;
    var anchor;
    if (!returning && scrollY > 0) {
      // Text between the same two illustrations can have different paragraphs
      // in each language. Keep the reading position within that shared section.
      var blocks = document.querySelectorAll('.cs-hero, .cs-body > .media, .case-copy, [data-i18n]:not(.case-copy), footer');
      for (var block of blocks) {
        if (block.closest('footer') && block.tagName !== 'FOOTER') continue;
        var bounds = anchorBounds(block);
        if (!bounds || bounds.bottom <= 0 || bounds.top >= innerHeight) continue;
        var offset = Math.max(0, bounds.top);
        anchor = { block: block, offset: offset, progress: (offset - bounds.top) / bounds.height };
        break;
      }
    }
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
    canonical.href = new URL(languageURL(language).pathname, canonical.href).href;
    ogURL.content = canonical.href;
    if (language === 'ru') document.head.appendChild(markdown);
    else markdown.remove();
    updateToggle(language);
    var prefix = '/' + language;
    document.querySelectorAll('[data-language-route]').forEach(function (link) {
      link.setAttribute('href', prefix + link.dataset.languageRoute);
    });
    document.dispatchEvent(new CustomEvent('portfolio:language-changed'));
    if (returning) {
      window.scrollTo({ top: lastSwitch.start, behavior: 'instant' });
    } else if (anchor) {
      var bounds = anchorBounds(anchor.block);
      if (bounds) window.scrollTo({
        top: window.scrollY + bounds.top + bounds.height * anchor.progress - anchor.offset,
        behavior: 'instant'
      });
    }
    lastSwitch = { from: previousLanguage, to: language, start: scrollY, end: window.scrollY,
      width: innerWidth, height: innerHeight };
  }
  function routeLanguage() {
    return /^\/ru(?:\/|$)/.test(location.pathname) ? 'ru' : 'en';
  }
  function languageURL(language) {
    var url = new URL(location.href);
    url.pathname = '/' + language + route;
    if (url.searchParams.has('lang')) url.searchParams.delete('lang');
    return url;
  }
  function updateToggle(language) {
    var target = language === 'ru' ? 'en' : 'ru';
    button.href = languageURL(target);
    buttonLabel.textContent = target.toUpperCase();
    button.setAttribute('aria-label', target === 'en' ? 'Switch to English' : 'Переключить на русский');
    button.lang = target;
    button.hreflang = target;
  }
  var requested = new URLSearchParams(location.search).get('lang');
  if (/^\/cases\//.test(location.pathname)) {
    history.replaceState(null, '', languageURL(requested === 'ru' ? 'ru' : 'en'));
    apply(routeLanguage());
  } else {
    updateToggle(document.documentElement.lang);
  }
  window.addEventListener('popstate', function () { apply(routeLanguage()); });
  button.addEventListener('click', async function (event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (switching) return;
    switching = true;
    button.setAttribute('aria-busy', 'true');
    var next = document.documentElement.lang === 'ru' ? 'en' : 'ru';
    var destination = languageURL(next);
    var motion = !reducedMotion.matches && typeof button.animate === 'function';
    try { localStorage.setItem('portfolio-language', next); } catch (error) {}
    try {
      if (motion) {
        await Promise.all([
          animate(visibleText(), [{ opacity: 1 }, { opacity: 0 }], 90),
          animate([buttonLabel], [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(-4px) scale(.9)' }], 90)
        ]);
      }
      var previousMedia = motion ? mediaPositions() : [];
      apply(next);
      history.replaceState(null, '', destination);
      if (motion) {
        await Promise.all([
          moveMedia(previousMedia),
          animate(visibleText(), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 320),
          animate([buttonLabel], [{ opacity: 0, transform: 'translateY(4px) scale(.9)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 180)
        ]);
      }
    } catch (error) {
      location.assign(destination);
    } finally {
      switching = false;
      button.removeAttribute('aria-busy');
    }
  });
})();
