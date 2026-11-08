/* Vision Plus — page Artisan OS : liens réels du logiciel (assets/config.js, artisanOS).
   Lien renseigné : les boutons concernés l’ouvrent. Lien vide : aucun téléchargement simulé ;
   les boutons du bloc d’accès restent masqués et Télécharger Artisan OS mène au bloc d’accès. */
(function () {
  var C = (window.VISIONPLUS_CONFIG || {}).artisanOS || {};
  function lien(u) { return typeof u === "string" && /^https:\/\//.test(u.trim()) ? u.trim() : ""; }
  var urls = { download: lien(C.download), webapp: lien(C.webApp) };
  var els = document.querySelectorAll("[data-ao]");
  for (var i = 0; i < els.length; i++) {
    var a = els[i], u = urls[a.getAttribute("data-ao")];
    if (u) {
      a.href = u;
      a.hidden = false;
      try { if (new URL(u).origin !== location.origin) a.rel = "noopener"; } catch (e) {}
    } else if (a.hasAttribute("data-ao-hide")) {
      a.hidden = true;
    } else {
      a.href = "#acces";
    }
  }
})();
