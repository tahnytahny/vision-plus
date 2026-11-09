/* Vision Plus — panorama des métiers (page Campagne ADS).
   Mise en valeur d’un univers au survol, au focus clavier ou à l’appui ; parallaxe à la souris ;
   bascule douce au défilement ; apparition à l’entrée dans l’écran ; animations arrêtées hors écran ;
   sur téléphone, la carte visible du carrousel allume son univers dans la vue d’ensemble. */
(function () {
  var root = document.querySelector(".mt");
  if (!root || !("IntersectionObserver" in window)) return;
  var stage = root.querySelector(".mt-stage");
  var dim = root.querySelector(".mt-dim");
  var cards = root.querySelector(".mt-cards");
  var reduce = matchMedia("(prefers-reduced-motion:reduce)");
  var phone = matchMedia("(max-width:760px)");
  root.classList.add("mt-js");

  /* ---------- univers actif ---------- */
  var on = null, pinned = null;
  function set(k) {
    k = k || null;
    if (k === on) return;
    on = k;
    if (k) { root.setAttribute("data-on", k); root.classList.remove("is-intro"); } else root.removeAttribute("data-on");
    var els = root.querySelectorAll("[data-k]");
    for (var i = 0; i < els.length; i++) {
      var hit = els[i].getAttribute("data-k") === k;
      els[i].classList.toggle("is-on", hit);
      if (els[i].tagName === "BUTTON") els[i].setAttribute("aria-pressed", hit ? "true" : "false");
    }
    var halo = k && root.querySelector('.mt-halo[data-k="' + k + '"]');
    if (halo) {
      var s = halo.style;
      dim.style.setProperty("--hx", s.getPropertyValue("--x").trim());
      dim.style.setProperty("--hy", s.getPropertyValue("--y").trim());
      dim.style.setProperty("--hw", (parseFloat(s.getPropertyValue("--w")) * 0.62).toFixed(2) + "%");
      dim.style.setProperty("--hh", (parseFloat(s.getPropertyValue("--h")) * 0.65).toFixed(2) + "%");
    }
  }
  function key(e) { var t = e.target.closest && e.target.closest("[data-k]"); return t && root.contains(t) ? t.getAttribute("data-k") : null; }

  /* souris : survol ; tactile et clic : épingler ou relâcher */
  stage.addEventListener("pointerover", function (e) { if (e.pointerType === "mouse") { var k = key(e); if (k) set(k); } });
  stage.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") set(pinned); });
  stage.addEventListener("click", function (e) {
    var k = key(e);
    if (phone.matches && k && k !== "hub") { montre(k); return; }
    pinned = k && pinned !== k ? k : null;
    set(pinned || (e.pointerType === "mouse" ? k : null));
  });
  root.addEventListener("focusin", function (e) { var k = key(e); if (k) set(k); });
  root.addEventListener("focusout", function () { set(pinned); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && on) { pinned = null; set(null); } });

  /* ---------- parallaxe à la souris (lissée, une image par trame au plus) ---------- */
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
  function loop() {
    raf = 0;
    cx += (tx - cx) * 0.075; cy += (ty - cy) * 0.075;
    stage.style.setProperty("--mx", cx.toFixed(4));
    stage.style.setProperty("--my", cy.toFixed(4));
    if (Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  root.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse" || reduce.matches || phone.matches) return;
    var r = root.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    kick();
  });
  root.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });

  /* ---------- défilement : la scène se redresse en arrivant au centre de l’écran ---------- */
  var vis = false, sraf = 0;
  function tick() {
    sraf = 0;
    if (reduce.matches) { stage.style.setProperty("--sy", "0"); return; }
    var r = root.getBoundingClientRect(), vh = window.innerHeight;
    var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
    stage.style.setProperty("--sy", Math.max(-1, Math.min(1, p)).toFixed(4));
  }
  function onScroll() { if (vis && !sraf) sraf = requestAnimationFrame(tick); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- apparition, animations seulement à l’écran, présentation des étiquettes ---------- */
  var intro = false;
  new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      vis = en.isIntersecting;
      root.classList.toggle("is-run", vis);
      if (!vis) return;
      onScroll();
      if (!root.classList.contains("is-in")) {
        root.classList.add("is-in");
        if (!intro && !reduce.matches && matchMedia("(hover:hover)").matches && !phone.matches) {
          intro = true;
          setTimeout(function () { root.classList.add("is-intro"); }, 1100);
          setTimeout(function () { root.classList.remove("is-intro"); }, 1100 + 2600 + 9 * 160);
        }
      }
    });
  }, { threshold: 0.12 }).observe(root);

  /* ---------- téléphone : carrousel relié à la vue d’ensemble ---------- */
  function montre(k) {
    var c = cards && cards.querySelector('.mt-card[data-k="' + k + '"]');
    if (c) c.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "nearest", inline: "center" });
  }
  if (cards) {
    var cio = new IntersectionObserver(function (es) {
      if (!phone.matches) return;
      es.forEach(function (en) { if (en.intersectionRatio >= 0.6) set(en.target.getAttribute("data-k")); });
    }, { root: cards, threshold: [0.6] });
    var list = cards.querySelectorAll(".mt-card");
    for (var i = 0; i < list.length; i++) cio.observe(list[i]);
    /* glisser le carrousel fait pivoter la vue d’ensemble, comme la souris sur ordinateur */
    var fromCards = function () {
      if (!phone.matches || reduce.matches) return;
      var max = cards.scrollWidth - cards.clientWidth;
      if (max > 0) { tx = (Math.abs(cards.scrollLeft) / max) * 2 - 1; if (getComputedStyle(cards).direction === "rtl") tx = -tx; ty = 0; kick(); }
    };
    cards.addEventListener("scroll", fromCards, { passive: true });
    fromCards();
  }
  function mode() { pinned = null; set(null); tx = ty = 0; kick(); onScroll(); }
  if (phone.addEventListener) phone.addEventListener("change", mode);
})();
