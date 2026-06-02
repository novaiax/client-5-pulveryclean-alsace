/* =====================================================
   PulveryClean Alsace - Interactions
   Vanilla JS, sans dependance. Tout est optionnel :
   le site reste utilisable si ce script ne charge pas.
   ===================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header : ombre au scroll ---------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 12) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var navToggle = document.getElementById("navToggle");
  var burger = document.getElementById("burger");
  var mainNav = document.getElementById("mainNav");

  var syncBurger = function () {
    if (!navToggle || !burger) { return; }
    burger.setAttribute("aria-expanded", navToggle.checked ? "true" : "false");
  };

  if (navToggle) {
    navToggle.addEventListener("change", syncBurger);
  }

  if (burger && navToggle) {
    // Permet d'ouvrir au clavier (Entree ou Espace) sur le label.
    burger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navToggle.checked = !navToggle.checked;
        syncBurger();
      }
    });
  }

  // Fermer le menu quand on clique un lien.
  if (mainNav && navToggle) {
    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        navToggle.checked = false;
        syncBurger();
      }
    });
  }

  // Fermer avec Echap.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navToggle && navToggle.checked) {
      navToggle.checked = false;
      syncBurger();
    }
  });

  /* ---------- Reveal au scroll (avec filet de securite) ---------- */
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
      }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
      revealItems.forEach(function (el) { observer.observe(el); });

      // Filet de securite : aucun contenu ne doit rester invisible.
      // Si l'observer n'a pas revele un element deja a l'ecran, on le force
      // apres le chargement complet de la page.
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

  /* ---------- Parallaxe legere du hero ---------- */
  var heroMedia = document.querySelector(".hero-media");
  if (heroMedia && !reduceMotion) {
    var ticking = false;
    var updateParallax = function () {
      var offset = window.scrollY * 0.18;
      heroMedia.style.transform = "translate3d(0," + offset + "px,0) scale(1.06)";
      ticking = false;
    };
    heroMedia.style.willChange = "transform";
    heroMedia.style.transform = "scale(1.06)";
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
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
      // Nettoie l'URL pour eviter de re-afficher le message au rechargement.
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  } catch (err) {
    // URLSearchParams non supporte : on ignore, le formulaire reste fonctionnel.
  }

})();
