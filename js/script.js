/* =====================================================
   PulveryClean Alsace - Interactions premium
   Vanilla JS, sans dépendance. Tout est progressif :
   le site reste 100% utilisable si ce script ne charge pas.
   ===================================================== */
(function () {
  "use strict";

  // Signale au filet de sécurité (script inline du <head>) que les
  // interactions se sont bien initialisées. Si ce fichier ne se charge
  // pas, le filet révèle tout le contenu pour éviter des sections vides.
  window.__pcReady = true;

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Header : ombre au scroll + barre de progression ---------- */
  var header = document.getElementById("siteHeader");
  var progress = document.querySelector(".scroll-progress");

  var onScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    if (header) { header.classList.toggle("scrolled", y > 12); }
    if (progress) {
      var h = document.documentElement;
      var max = (h.scrollHeight - h.clientHeight) || 1;
      progress.style.width = (Math.min(y / max, 1) * 100) + "%";
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById("navToggle");
  var burger = document.getElementById("burger");
  var mainNav = document.getElementById("mainNav");

  var syncBurger = function () {
    if (!navToggle || !burger) { return; }
    burger.setAttribute("aria-expanded", navToggle.checked ? "true" : "false");
    burger.setAttribute("aria-label", navToggle.checked ? "Fermer le menu" : "Ouvrir le menu");
  };

  if (navToggle) { navToggle.addEventListener("change", syncBurger); }

  if (burger && navToggle) {
    burger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navToggle.checked = !navToggle.checked;
        syncBurger();
      }
    });
  }

  if (mainNav && navToggle) {
    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { navToggle.checked = false; syncBurger(); }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle && navToggle.checked) {
      navToggle.checked = false; syncBurger();
    }
  });

  /* ---------- Reveal au scroll (avec filet de sécurité) ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    var showAll = function () {
      revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      showAll();
    } else {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: "0px 0px -7% 0px" });
      revealItems.forEach(function (el) { observer.observe(el); });

      // Filet de sécurité : rien ne doit rester invisible.
      window.addEventListener("load", function () {
        window.setTimeout(function () {
          document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) { el.classList.add("is-visible"); }
          });
        }, 300);
      });
    }
  }

  /* ---------- Compteurs animés ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var runCounter = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-decimals") || "0") | 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1500;
    var start = null;
    var fmt = function (v) {
      return prefix + v.toFixed(decimals).replace(".", ",") + suffix;
    };
    if (reduceMotion) { el.textContent = fmt(target); return; }
    var tick = function (ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) { requestAnimationFrame(tick); }
      else { el.textContent = fmt(target); }
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      var cObs = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCounter(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cObs.observe(el); });
    }
  }

  /* ---------- FAQ accordéon ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) { return; }
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // Ferme les autres (accordéon exclusif).
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          var ob = other.querySelector(".faq-q");
          var op = other.querySelector(".faq-a");
          if (ob) { ob.setAttribute("aria-expanded", "false"); }
          if (op) { op.style.maxHeight = null; }
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
  // Recalcule la hauteur du panneau ouvert au redimensionnement.
  window.addEventListener("resize", function () {
    var open = document.querySelector(".faq-item.open .faq-a");
    if (open) { open.style.maxHeight = open.scrollHeight + "px"; }
  });

  /* ---------- Comparateur avant / après ---------- */
  document.querySelectorAll("[data-ba]").forEach(function (slider) {
    var range = slider.querySelector(".ba-range");
    if (!range) { return; }
    var apply = function (v) { slider.style.setProperty("--pos", v + "%"); };
    apply(range.value);
    range.addEventListener("input", function () { apply(range.value); });
    // Glisser-déposer n'importe où sur l'image (en plus du curseur natif).
    var dragging = false;
    var setFromX = function (clientX) {
      var r = slider.getBoundingClientRect();
      var p = ((clientX - r.left) / r.width) * 100;
      p = Math.max(0, Math.min(100, p));
      range.value = p;
      apply(p);
    };
    slider.addEventListener("pointerdown", function (e) {
      if (e.target === range) { return; } // laisse le curseur natif gérer
      dragging = true;
      setFromX(e.clientX);
    });
    window.addEventListener("pointermove", function (e) { if (dragging) { setFromX(e.clientX); } }, { passive: true });
    window.addEventListener("pointerup", function () { dragging = false; });
  });

  /* ---------- Boutons magnétiques (desktop, pointeur fin) ---------- */
  if (canHover && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var strength = 0.28;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + (x * strength) + "px," + (y * strength) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Parallaxe légère du hero ---------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia && !reduceMotion) {
    var ticking = false;
    var updateParallax = function () {
      var offset = (window.scrollY || 0) * 0.16;
      heroMedia.style.transform = "translate3d(0," + offset + "px,0) scale(1.08)";
      ticking = false;
    };
    heroMedia.style.willChange = "transform";
    heroMedia.style.transform = "scale(1.08)";
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
  }

  /* ---------- Filtres de la galerie ---------- */
  var filters = document.querySelectorAll(".filter");
  var grid = document.getElementById("galleryGrid");
  var emptyMsg = document.getElementById("galleryEmpty");

  if (filters.length && grid) {
    var items = grid.querySelectorAll(".gallery-item");
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-filter");
        filters.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        var shown = 0;
        items.forEach(function (item) {
          var match = value === "all" || item.getAttribute("data-cat") === value;
          item.style.display = match ? "" : "none";
          if (match) { shown++; }
        });
        if (emptyMsg) { emptyMsg.hidden = shown !== 0; }
      });
    });
  }

  /* ---------- Confirmation d'envoi du formulaire ---------- */
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get("envoi") === "ok") {
      var success = document.getElementById("formSuccess");
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  } catch (err) { /* URLSearchParams non supporté : on ignore. */ }

})();
