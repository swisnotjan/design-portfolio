/* Portfolio funnel. Preview events stay in the console; only production sends to GA4. */
(function () {
  "use strict";
  var main = document.querySelector("main");
  var caseId = main && main.dataset.caseId || "none";
  var production = /^(www\.)?simonovsky\.com$/.test(location.hostname);

  function track(name, details) {
    var params = Object.assign({
      page_type: caseId === "none" ? "home" : "case",
      case_id: caseId,
      transport_type: "beacon"
    }, details);
    if (!production) {
      console.info("[portfolio analytics]", name, params);
      return;
    }
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  }

  function placement(element) {
    return element.closest("footer") ? "footer" : element.closest(".contact") ? "intro" : "case_body";
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (!link) return;
    if (link.matches("a.case[data-case-id]")) {
      track("case_open", {
        case_id: link.dataset.caseId,
        placement: event.target.closest(".case-cta") ? "case_button" : "case_card"
      });
      return;
    }
    var url = new URL(link.href, location.href);
    var where = placement(link);
    if (url.protocol === "mailto:") track("contact_click", { method: "email", placement: where });
    else if (/^(www\.)?linkedin\.com$/.test(url.hostname)) track("contact_click", { method: "linkedin", placement: where });
    else if (url.origin === location.origin && (/\/cv\/?$/.test(url.pathname) || /\.pdf$/i.test(url.pathname))) {
      track("cv_open", { placement: where });
    } else if (url.hostname === "yonder.site" || url.hostname === "www.figma.com") {
      track("project_open", { project_id: url.hostname === "yonder.site" ? "yonder" : "todoodle", placement: where });
    }
  });

  // Sent by copy handlers only after the clipboard operation succeeds, including keyboard use.
  document.addEventListener("portfolio:email-copied", function (event) {
    track("contact_click", { method: "copy_email", placement: event.detail.placement });
  });

  if (!("IntersectionObserver" in window)) return;
  var records = [];
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var record = records.find(function (item) { return item.element === entry.target; });
      record.visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      schedule(record);
    });
  }, { threshold: [0, 0.5] });

  function schedule(record) {
    clearTimeout(record.timer);
    if (!record.visible || record.sent || document.visibilityState !== "visible") return;
    record.timer = setTimeout(function () {
      if (!record.visible || document.visibilityState !== "visible") return;
      record.sent = true;
      track(record.name, record.params);
      observer.unobserve(record.element);
    }, 1000);
  }

  function observe(element, name, params) {
    records.push({ element: element, name: name, params: params, visible: false, sent: false });
    observer.observe(element);
  }

  // Observe the title rather than the entire potentially tall video card.
  document.querySelectorAll("a.case[data-case-id]").forEach(function (card) {
    observe(card.querySelector(".case-title"), "case_impression", { case_id: card.dataset.caseId });
  });
  document.querySelectorAll("[data-section]").forEach(function (section) {
    observe(section, "case_section_view", { section_id: section.dataset.section });
  });

  // Reading depth uses explicit 25/50/75% milestones; GA's automatic 90% scroll is unchanged.
  var milestones = [25, 50, 75];
  var activeSeconds = 0;
  var deepest = 0;
  function readDepth() {
    var range = document.documentElement.scrollHeight - window.innerHeight;
    var depth = range > 0 ? Math.round(window.scrollY / range * 100) : 0;
    if (document.visibilityState === "visible") deepest = Math.max(deepest, depth);
    if (activeSeconds < 10) return;
    milestones = milestones.filter(function (percent) {
      if (deepest < percent) return true;
      track("case_read_depth", { percent_scrolled: percent });
      return false;
    });
  }
  if (caseId !== "none") {
    window.addEventListener("scroll", readDepth, { passive: true });
    var clock = setInterval(function () {
      if (document.visibilityState === "visible" && document.hasFocus()) activeSeconds++;
      readDepth();
      if (!milestones.length) clearInterval(clock);
    }, 1000);
  }
  document.addEventListener("visibilitychange", function () { records.forEach(schedule); });
})();
