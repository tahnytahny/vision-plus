/* Vision Plus — publications de la démo Marketing IA (accueil et page Découvrir).
   Instagram : KARTEZZI France · Facebook : EcoLED Europe · LinkedIn : HeyZack AI.
   Un clic (ou Entrée) sur une carte ouvre la publication en grand ; × ou Échap la referme. */
(function(){
"use strict";
var POSTS=[
  {k:"ig",net:"Instagram",badge:"IG",account:"kartezzi.france",name:"KARTEZZI France",avatar:"assets/posts/kartezzi-avatar.webp",
   img:"assets/posts/kartezzi.webp",w:1044,h:738,
   alt:"Publication Instagram de KARTEZZI France : showroom de panneaux décoratifs (lames, effet marbre, texture tissu, bois, couleurs unies) et intérieurs aménagés en styles japonais, industriel, contemporain et minimaliste.",
   caption:"Chaque espace raconte une histoire…",link:"https://www.instagram.com/kartezzi.france/",linkLabel:"Voir le compte Instagram"},
  {k:"fb",net:"Facebook",badge:"f",account:"EcoLED Europe",name:"EcoLED Europe",avatar:"assets/posts/ecoled-avatar.webp",
   img:"assets/posts/ecoled-photo.webp",w:1356,h:608,
   alt:"Publication Facebook d'EcoLED Europe : réglette LED industrielle suspendue dans un entrepôt, avec les mentions Haute performance, Économe en énergie, Robuste et durable.",
   caption:"La lumière, pensée pour vos projets.\nDécouvrez notre réglette LED industrielle : robuste, performante et économe en énergie, idéale pour vos espaces professionnels (ateliers, entrepôts, parkings, zones de production…).\n– Éclairage puissant et homogène\n– Faible consommation\n– Installation simple et rapide\nEcoLED Europe, des solutions d'éclairage fiables et durables.",
   tags:"#EcoLED #EclairageLED #EclairageIndustriel #LED #EfficacitéÉnergétique #Industrie"},
  {k:"li",net:"LinkedIn",badge:"in",account:"Heyzack AI",name:"Heyzack AI",sub:"19 abonnés · 1 sem.",avatar:"assets/posts/heyzack-avatar.webp",
   img:"assets/posts/heyzack.webp",w:960,h:604,
   alt:"Visuels de la publication LinkedIn de HeyZack AI : un personnage nommé Zack, « Et si HeyZack était une personne ? » et « Il se lève avant vous, et rallume le chauffage juste à temps ».",
   caption:"Il se lève avant vous pour rallumer le chauffage.\nIl éteint la lumière que vous avez oubliée.\nIl veille sur la maison quand vous partez… et quand vous dormez.\n\nIl s'appelle Zack. Enfin… presque. 😉\n\nZack n'existe pas, mais HeyZack, si : la domotique pilotée par l'IA qui s'occupe de votre maison à votre place.\n\nPlus de confort. Moins de gaspillage. Sans y penser.\n\n👉 www.heyzack.ai",
   tags:"#HeyZack #Domotique #IA #SmartHome #Energie",link:"https://www.heyzack.ai",linkLabel:"Visiter heyzack.ai"}
];
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function nl(s){return esc(s).replace(/\n/g,"<br>");}
var css='.sp{cursor:zoom-in;outline:none}.sp:focus-visible{box-shadow:0 0 0 2px #B9D7FA,0 0 22px rgba(31,119,233,.5)!important}'+
 '.sp-acc{display:flex;align-items:center;gap:10px;padding:10px 12px 8px}.sp-acc img{width:34px;height:34px;border-radius:50%;object-fit:cover;flex:none;background:#000}.sp-li .sp-acc img{border-radius:8px}'+
 '.sp-acc b{display:block;font-size:.88rem;line-height:1.2;color:#fff}.sp-acc small{display:block;font-size:.74rem;color:var(--mut)}'+
 '.sp-media{position:relative;overflow:hidden;background:#101419;aspect-ratio:3/2}.sp-media img{width:100%!important;height:100%!important;object-fit:cover;object-position:center}.sp-wide::before{content:"";position:absolute;inset:-20px;background:var(--bg) center/cover;filter:blur(18px) brightness(.55);transform:scale(1.1)}.sp-wide img{position:relative;object-fit:contain!important}.sp-media img,.sp-shot img{display:block;width:100%;height:auto;transition:transform .6s var(--ease)}'+
 '.sp:hover .sp-media img,.sp:hover .sp-shot img{transform:scale(1.025)}'+
 '.sp-cap{padding:10px 12px 12px;font-size:.86rem;line-height:1.45;color:var(--soft);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}'+
 '.sp-fb .sp-cap{display:block;-webkit-line-clamp:unset;overflow:visible}.sp-fb .sp-cap em{display:block;margin-top:6px;font-style:normal;color:var(--cyan)}.sp-cap b{color:#fff;margin-right:6px}.sp-meta{padding:0 12px 12px;font-size:.76rem;color:var(--mut)}'+
 '.sp-shot{position:relative;background:#fff;overflow:hidden}.sp-demo{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;align-self:flex-start;margin:10px 12px 12px;padding:.3em .7em;border-radius:999px;font-size:.7rem;font-weight:600;color:#B9D7FA;border:1px solid rgba(170,183,199,.4);background:rgba(31,119,233,.08)}'+
 '.sp-zoom{position:absolute;right:8px;top:8px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(2,8,14,.72);border:1px solid rgba(170,183,199,.5);color:#B9D7FA;opacity:0;transition:opacity .3s}.sp:hover .sp-zoom,.sp:focus-visible .sp-zoom{opacity:1}.sp-zoom svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2}'+
 '.sp-fb-fallback{padding:14px;color:#1c1e21;font-size:.86rem;line-height:1.45;display:grid;gap:8px}'+
 '.modal-in.sp-big{width:min(880px,100%);padding:clamp(16px,3vw,24px)}.sp-big .sp-big-media{border-radius:12px;overflow:hidden;background:#000}.sp-big img{display:block;width:100%;height:auto}'+
 '.sp-big .sp-big-cap{white-space:normal;color:var(--soft);font-size:.95rem;line-height:1.55;max-height:40vh;overflow:auto}.sp-big .sp-big-cap .tg{color:var(--cyan)}'+
 '@media (min-width:980px){#marketing .device{background:linear-gradient(180deg,#161D26,#101419);overflow:visible}#marketing .posts{perspective:1600px;padding:30px 18px 96px;align-items:start;background:url(assets/3d/ag-socle.webp) center bottom/100% auto no-repeat}#marketing .sp{transform:rotateY(-9deg) rotateX(3deg) translateZ(0);transform-origin:center bottom;box-shadow:0 30px 50px -24px rgba(0,0,0,.95),0 0 0 1px rgba(170,183,199,.22),0 0 26px rgba(40,120,232,.14);transition:transform .6s var(--ease),box-shadow .5s}#marketing .sp:nth-child(2){transform:rotateY(-9deg) rotateX(3deg) translateY(-14px)}#marketing .sp:nth-child(3){transform:rotateY(-9deg) rotateX(3deg) translateY(-28px)}#marketing .sp:hover{transform:rotateY(0) rotateX(0) translateY(-34px);box-shadow:0 40px 60px -24px rgba(0,0,0,.95),0 0 0 1px rgba(120,180,245,.6),0 0 34px rgba(40,120,232,.35);z-index:2}}'+
 '@media (prefers-reduced-motion:reduce){#marketing .sp,#marketing .sp:hover{transform:none!important}.sp:hover .sp-media img,.sp:hover .sp-shot img{transform:none}}';
function addCss(){if(document.getElementById("sp-css"))return;var s=document.createElement("style");s.id="sp-css";s.textContent=css;document.head.appendChild(s);}
var ZOOM='<span class="sp-zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></svg></span>';
function card(p,anim){
  var head='<div class="post-h"><span class="net '+p.k+'" aria-hidden="true">'+p.badge+"</span>"+p.net+"</div>";
  var body;
  {
    body='<div class="sp-acc"><img src="'+p.avatar+'" alt="" width="34" height="34" loading="lazy"><div><b>'+esc(p.account)+"</b>"+(p.sub?"<small>"+esc(p.sub)+"</small>":"")+'</div></div>'+
      '<div class="sp-media'+(p.k!=="ig"?" sp-wide":"")+'"'+(p.k!=="ig"?' style="--bg:url('+p.img+')"':"")+'>'+ZOOM+'<img src="'+p.img+'" width="'+p.w+'" height="'+p.h+'" alt="'+esc(p.alt)+'" loading="lazy"></div>'+
      '<div class="sp-cap">'+(p.k==="ig"?"<b>"+esc(p.account)+"</b>":"")+nl(p.caption)+(p.tags?'<br><em>'+esc(p.tags)+"</em>":"")+"</div>"+(p.meta?'<div class="sp-meta">'+esc(p.meta)+"</div>":"");
  }
  return '<article class="post sp sp-'+p.k+(anim?" fade":"")+'" tabindex="0" role="button" data-post="'+p.k+'" aria-label="Agrandir la publication '+p.net+' de '+esc(p.name)+'">'+head+body+"</article>";
}
function open(p){var A=window.VISIONPLUS;if(!A||!A.modal)return;
  var media='<img src="'+p.img+'" alt="'+esc(p.alt)+'">';
  var cap=
    '<div class="sp-big-cap">'+nl(p.caption)+(p.tags?'<br><span class="tg">'+esc(p.tags)+"</span>":"")+"</div>"+(p.link?'<p><a class="link" href="'+p.link+'" target="_blank" rel="noopener">'+esc(p.linkLabel)+" ↗</a></p>":"");
  var m=A.modal('<div class="modal-h"><div><span class="eyebrow">'+p.net+'</span><h2 class="h-m" style="margin-top:8px">'+esc(p.name||"EcoLED Europe")+'</h2></div><button class="x" data-close aria-label="Fermer la publication">'+A.icon("x")+'</button></div><div class="sp-big-media">'+media+"</div>"+cap);
  m.querySelector(".modal-in").classList.add("sp-big");}
function bind(root){
  root.addEventListener("click",function(e){var c=e.target.closest("[data-post]");if(!c)return;var p=POSTS.find(function(x){return x.k===c.dataset.post;});if(p)open(p);});
  root.addEventListener("keydown",function(e){if(e.key!=="Enter"&&e.key!==" ")return;var c=e.target.closest("[data-post]");if(!c)return;e.preventDefault();c.click();});
  root.addEventListener("error",function(e){var t=e.target;if(t.tagName==="IMG"&&t.dataset.fallback){var p=POSTS[1];var d=document.createElement("div");d.className="sp-fb-fallback";d.innerHTML="<b>EcoLED Europe</b>"+p.fallback.map(function(x){return "<span>"+esc(x)+"</span>";}).join("");t.replaceWith(d);}},true);
}
window.VISIONPLUS_POSTS={list:POSTS,render:function(el,anim){addCss();if(!el._sp){bind(el);el._sp=1;}el.innerHTML=POSTS.map(function(p){return card(p,anim);}).join("");
  if(anim)[].forEach.call(el.children,function(c,i){setTimeout(function(){c.classList.remove("fade");},matchMedia("(prefers-reduced-motion: reduce)").matches?0:120+i*160);});}};
})();
