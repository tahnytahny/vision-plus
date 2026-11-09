/* Vision Plus — PROPOSITION 1 « Vision Plus NEON BLUE »
   Ajoute sur l'accueil : sol en grille lumineuse et interfaces flottantes (agents en action) dans le héros,
   avec une parallaxe douce à la souris (au défilement et au toucher sur téléphone et tablette). Rien n'est retiré ni modifié dans le contenu existant. */
(function(){
"use strict";
var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
var fine=matchMedia("(hover:hover) and (pointer:fine)").matches;

function svg(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+"</svg>";}
var I={
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  mega:'<path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M10 6c4 0 7-2 9-3v18c-2-1-5-3-9-3"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>'
};

function home(){
  var hero=document.querySelector(".hero"),scene=hero&&hero.querySelector(".scene"),stack=scene&&scene.querySelector(".stack");
  if(!hero||!scene||!stack||scene.querySelector(".p1-holo"))return;

  /* sol en grille lumineuse (décor) */
  var floor=document.createElement("div");floor.className="p1-floor";floor.setAttribute("aria-hidden","true");floor.innerHTML="<i></i>";
  hero.insertBefore(floor,hero.firstChild);

  /* interfaces flottantes : les trois agents en action */
  var bars="";for(var k=0;k<28;k++)bars+='<i style="animation-delay:-'+((k*137)%1100)/1000+'s"></i>';
  var holo=document.createElement("div");holo.className="p1-holo";
  holo.setAttribute("role","img");
  holo.setAttribute("aria-label","Les agents Vision Plus en action : un appel entrant est pris par l'agent IA, qui confirme un rendez-vous à 14 h 30 ; l'agent marketing a généré 3 publications ; l'agent de gestion a mis le site à jour.");
  holo.innerHTML=
    '<div class="p1-card p1-call"><div class="p1-in">'+
      '<div class="p1-h">'+svg(I.phone)+'Secrétaire IA<span class="p1-live">En ligne</span></div>'+
      '<div class="p1-wave">'+bars+'</div>'+
      '<ol class="p1-tl"><li>Appel entrant</li><li>Agent IA décroche</li><li>Rendez-vous confirmé <b>14:30</b></li></ol>'+
    '</div></div>'+
    '<div class="p1-card p1-posts"><div class="p1-in">'+
      '<div class="p1-h">'+svg(I.mega)+'Marketing IA</div>'+
      '<div class="p1-big"><b>3</b> publications générées</div>'+
      '<div class="p1-thumbs"><i data-n="IG"></i><i data-n="f"></i><i data-n="in"></i></div>'+
      '<span class="p1-ok">Prêtes à valider</span>'+
    '</div></div>'+
    '<div class="p1-card p1-site"><div class="p1-in">'+
      '<div class="p1-h">'+svg(I.layers)+'Gestion web app</div>'+
      '<div class="p1-big">Site mis à jour</div>'+
      '<div class="p1-bar"><i></i></div>'+
      '<div class="p1-row"><span class="p1-ok">En ligne</span><small>SYNC 100 %</small></div>'+
    '</div></div>'+
    /* panneau carré flottant en verre noir et bleu nuit, logo Vision Plus centré (même flottement et même parallaxe que les écrans) */
    '<div class="p1-card p1-brand"><div class="p1-brand-in"><img src="assets/brand/vp-logo.webp" alt="" width="1131" height="200" decoding="async"></div></div>';
  stack.insertAdjacentElement("afterend",holo);
  /* téléphone : le même panneau au logo, sous les écrans, dans le flux de la page (les cartes flottantes y sont masquées) */
  var bm=document.createElement("div");bm.className="p1-brand-m";bm.setAttribute("aria-hidden","true");
  bm.innerHTML='<div class="p1-brand-in"><img src="assets/brand/vp-logo.webp" alt="" width="1131" height="200" decoding="async"></div>';
  scene.appendChild(bm);

  /* pause hors écran et onglet masqué */
  var visible=true;
  function sync(){hero.classList.toggle("p1-off",!visible||document.hidden);}
  if("IntersectionObserver" in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting;sync();}).observe(hero);}
  document.addEventListener("visibilitychange",sync);

  /* parallaxe douce : à la souris sur ordinateur ; sur écran tactile, au défilement et au toucher ; jamais en mouvement réduit */
  if(reduced)return;
  var tx=0,ty=0,raf=0;
  function apply(){raf=0;scene.style.setProperty("--px",tx.toFixed(3));scene.style.setProperty("--py",ty.toFixed(3));}
  function queue(){if(!raf)raf=requestAnimationFrame(apply);}
  if(fine){
    hero.addEventListener("pointermove",function(e){if(e.pointerType&&e.pointerType!=="mouse")return;
      var r=hero.getBoundingClientRect();
      tx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));ty=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));queue();});
    hero.addEventListener("pointerleave",function(){tx=0;ty=0;queue();});
    return;
  }
  /* téléphone et tablette : les écrans pivotent pendant le défilement (comme la souris qui balaie le héros),
     un appui sur la scène les oriente vers le doigt, puis ils reviennent doucement */
  var held=0,hx=0,hy=0,back=0;
  function follow(){
    if(held){tx=hx;ty=hy;}
    else{var r=scene.getBoundingClientRect(),vh=window.innerHeight||1;
      var p=Math.max(-1,Math.min(1,(r.top+r.height/2-vh/2)/(vh/2+r.height/2)));
      ty=p*0.9;tx=-p*0.55;}
    queue();
  }
  function onScroll(){if(visible)follow();}
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);
  scene.addEventListener("pointerdown",function(e){if(e.pointerType==="mouse")return;
    var r=scene.getBoundingClientRect();clearTimeout(back);
    hx=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1));hy=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));held=1;follow();});
  function release(){if(!held)return;clearTimeout(back);back=setTimeout(function(){held=0;follow();},650);}
  scene.addEventListener("pointerup",release);scene.addEventListener("pointercancel",release);
  follow();
}

function start(){if(document.querySelector('meta[name="vp-page"][content="home"]'))home();}
if(document.querySelector(".top"))start();else document.addEventListener("vp:ready",start);
})();
