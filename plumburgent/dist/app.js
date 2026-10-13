/* =============================================================
   INTERACTIONS — progressive enhancement, zero dependencies.
   Sticky header glass · reveal-on-scroll · hero parallax ·
   single-open FAQ · current year. Honors reduced-motion.
   ============================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header glass state */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("glass", window.scrollY > 10); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* Subtle parallax on hero float cards (fine pointers only) */
  if (!reduce && window.matchMedia("(pointer:fine)").matches) {
    var hero = document.querySelector(".hero-visual");
    var floats = hero ? hero.querySelectorAll(".float-card") : [];
    if (hero && floats.length) {
      hero.addEventListener("mousemove", function (ev) {
        var r = hero.getBoundingClientRect();
        var dx = (ev.clientX - r.left - r.width / 2) / r.width;
        var dy = (ev.clientY - r.top - r.height / 2) / r.height;
        floats.forEach(function (f, i) {
          var depth = (i + 1) * 7;
          f.style.transform = "translate(" + (dx * depth).toFixed(1) + "px," + (dy * depth).toFixed(1) + "px)";
        });
      });
      hero.addEventListener("mouseleave", function () {
        floats.forEach(function (f) { f.style.transform = ""; });
      });
    }
  }

  /* FAQ: single-open accordion */
  var faqItems = document.querySelectorAll(".faq details");
  faqItems.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqItems.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
