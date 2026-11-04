/* AXIA — application mobile (écrans ≤ 760 px uniquement).
   7 onglets : Accueil · Services · Simulation · Abonnements · Aide (FAQ, SAV, service client, contact) · Infos légales (CGV, mentions, confidentialité, cookies, consentement) · Compte. Chaque onglet est un écran
   indépendant qui s'ouvre toujours en haut. Rien ne s'applique au-delà de 760 px (version ordinateur intacte).
   Matrice des écrans et règles de connexion : voir MOBILE.md. */
(function(){
"use strict";
var MQ=matchMedia("(max-width:760px)");
var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
var ACCOUNT_PAGES=["compte","connexion","inscription","mot-de-passe","espace-client"];
var TOP_TABS={home:1,decouvrir:1,demo:1,abonnements:1,compte:1,"espace-client":1};
var TITLES={"telephone-ia":"Secrétaire IA",home:"Accueil",decouvrir:"Services",demo:"Simulation",abonnements:"Abonnements",compte:"Compte",faq:"FAQ",assistant:"Assistant IA",sav:"Assistance",connexion:"Se connecter",inscription:"Créer un compte","mot-de-passe":"Mot de passe oublié","espace-client":"Mon espace",legal:"Informations légales"};
/* écrans de la rubrique Services */
var SVC=[
  {id:"telephone",t:"Votre secrétaire IA",s:"Appels, rendez-vous, devis, e-mails : les missions que vous choisissez.",i:"phone",tab:"tab-telephone",sec:"agents"},
  {href:"telephone-ia.html",t:"Secrétariat intelligent",s:"Appels, rendez-vous, devis, e-mails et dossiers.",i:"file"},
  {id:"marketing",t:"Marketing IA",s:"Vos publications prêtes à valider.",i:"mega",tab:"tab-marketing",sec:"agents"},
  {id:"gestion",t:"Gestion web app",s:"Votre site modifié en une phrase.",i:"layers",tab:"tab-gestion",sec:"agents"},
  {g:"Comprendre AXIA"},
  {id:"axia-simple",t:"Qu'est-ce qu'AXIA ?",s:"AXIA expliqué simplement.",i:"info"},
  {id:"technologie",t:"Notre technologie",s:"Une IA connectée à toute votre activité.",i:"spark"},
  {id:"fonctionnement",t:"Fonctionnement",s:"Une information, aucune ressaisie.",i:"chart"},
  {id:"avantages",t:"Avantages",s:"Moins de tâches, plus de clients.",i:"check"},
  {id:"secteurs",t:"Pour qui",s:"Les métiers accompagnés.",i:"user"},
  {id:"commencer",t:"Commencer",s:"Trois étapes pour démarrer.",i:"arrow"}
];
var ALIAS={agents:"telephone",service:"telephone"};
/* menu de l'onglet Aide : [adresse, titre, précision, icône] */
var HELP=[
  ["faq.html","FAQ","Questions et réponses","help"],
  ["sav.html","SAV","Ouvrir une demande d'assistance","life"],
  ["sav.html#suivi","Service client","Suivre une demande, échanger avec l'équipe","chat"],
  ["sav.html#contact","Contact","E-mail et téléphone","mail"]
];
var HELP_PAGES={faq:1,sav:1,assistant:1};
/* menu de l'onglet Informations légales : [page, titre, icône] ; les PDF viennent de AXIA.legalDocs (axia.js) */
var LEGAL=[["cgv.html","CGV","file"],["mentions-legales.html","Mentions légales","file"],["confidentialite.html","Confidentialité","lock"],["cookies.html","Cookies","info"]];

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function top0(){window.scrollTo(0,0);}
try{if("scrollRestoration" in history&&MQ.matches)history.scrollRestoration="manual";}catch(e){}

function build(){
  var A=window.AXIA;if(!A||document.querySelector(".m-tabbar"))return;
  var page=A.page();var root=document.documentElement;root.classList.add("m-ready");
  var u=A.auth.current();
  var title=document.createElement("span");title.className="m-title";

  /* ---------- en-tête : logo (accueil) ou titre ; bouton retour sur les écrans secondaires ---------- */
  var top=document.querySelector(".top-in"),back=null;
  if(top){
    back=el("a","m-back",A.icon("chev","chev")+'<span class="sr">Retour</span>');back.href="index.html";back.setAttribute("aria-label","Retour");
    back.addEventListener("click",function(e){
      if(page==="decouvrir"&&root.getAttribute("data-svc")&&root.getAttribute("data-svc")!=="list"){e.preventDefault();goSvc("",true);return;}
      try{if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){e.preventDefault();history.back();}}catch(x){}});
    top.insertBefore(back,top.firstChild);top.appendChild(title);
    setHeader(TITLES[page]||document.title.split("·")[0].trim(),!TOP_TABS[page]);
    if(page==="home")root.classList.add("m-is-home");
  }
  function setHeader(t,showBack){title.textContent=t;root.classList.toggle("m-inner",page!=="home"||showBack);if(back)back.hidden=!showBack;}

  /* ---------- barre d'onglets ---------- */
  var acctHref=u?"espace-client.html#tableau":"compte.html";
  var tabs=[["home","index.html","Accueil","home"],["decouvrir","decouvrir.html","Services","layers"],["demo","demo.html","Simulation","play"],["abonnements","abonnements.html","Abonnements","card"],["compte",acctHref,"Compte","user"]];
  var cur=ACCOUNT_PAGES.indexOf(page)>=0?"compte":(page==="telephone-ia"?"decouvrir":page);
  var bar=el("nav","m-tabbar");bar.setAttribute("aria-label","Navigation principale");
  var tabHtml=tabs.map(function(t){return '<a href="'+t[1]+'" data-tab="'+t[0]+'"'+(t[0]===cur?' aria-current="page"':"")+'><span class="m-ti">'+A.icon(t[3])+(t[0]==="compte"&&u?'<i class="m-dot" aria-hidden="true"></i>':"")+"</span><span>"+t[2]+"</span></a>";});
  /* onglet « Aide » (avant Compte) : ouvre un petit menu au-dessus de la barre */
  /* onglets « Aide » et « Informations légales » (avant Compte) : chacun ouvre un petit menu au-dessus de la barre */
  tabHtml.splice(4,0,
    '<button type="button" class="m-more" id="m-help-btn" aria-haspopup="true" aria-expanded="false" aria-controls="m-help"'+(HELP_PAGES[page]?" data-active":"")+'><span class="m-ti">'+A.icon("help")+"</span><span>Aide</span></button>",
    '<button type="button" class="m-more m-more-2l" id="m-legal-btn" aria-haspopup="true" aria-expanded="false" aria-controls="m-legal"'+(page==="legal"?" data-active":"")+'><span class="m-ti">'+A.icon("balance")+"</span><span>Infos légales</span></button>");
  bar.innerHTML=tabHtml.join("");
  document.body.appendChild(bar);
  popMenu(bar.querySelector("#m-help-btn"),"m-help","Aide",helpItems(A));
  popMenu(bar.querySelector("#m-legal-btn"),"m-legal","Informations légales",legalItems(A));
  /* toucher l'onglet déjà actif : retour au début de l'écran (et à la liste des services) */
  bar.addEventListener("click",function(e){var a=e.target.closest("a");if(!a||a.getAttribute("aria-current")!=="page")return;
    if(page==="decouvrir"){e.preventDefault();goSvc("",true);return;}
    if(page==="espace-client"&&location.hash!=="#tableau"){return;}
    e.preventDefault();window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});});

  /* ---------- ACCUEIL : écran épuré ---------- */
  if(page==="home"){
    root.classList.add("m-home");
    var ht=document.querySelector(".hero-text"),acts=ht&&ht.querySelector(".actions"),scene=document.querySelector(".hero .scene");
    if(ht&&scene){scene.classList.add("m-scene");ht.appendChild(scene);}
    if(ht){var cta=el("div","m-home-cta",'<a class="btn btn-cyan" href="decouvrir.html">Découvrir nos services '+A.icon("arrow","arrow")+'</a>'+(u?'<a class="btn btn-line" href="espace-client.html#tableau">Mon espace</a>':'<a class="btn btn-line" href="inscription.html" data-auth="signup">Créer un compte</a>'));ht.appendChild(cta);}
  }

  /* ---------- SERVICES : liste de cartes + un écran par service ---------- */
  if(page==="decouvrir"){
    root.classList.add("m-svc");
    var main=document.querySelector("main");var hero=main.querySelector(".page-hero");
    var list=el("section","m-svc-list");list.setAttribute("aria-label","Nos services");
    list.innerHTML='<div class="wrap">'+SVC.map(function(s){if(s.g)return '<p class="m-svc-g">'+s.g+"</p>";
      return '<a class="m-svc-card" href="'+(s.href||"#"+s.id)+'"><span class="m-svc-ic">'+A.icon(s.i)+'</span><span class="m-svc-t"><b>'+s.t+"</b><small>"+s.s+"</small></span>"+A.icon("chev","go")+"</a>";}).join("")+"</div>";
    hero.parentNode.insertBefore(list,hero.nextSibling);
    window.addEventListener("hashchange",function(){renderSvc(true);});
    renderSvc(false);
  }
  function svcFromHash(){var h=(location.hash||"").slice(1);h=ALIAS[h]||h;return SVC.filter(function(s){return s.id===h;})[0]||null;}
  function renderSvc(anim){
    var s=svcFromHash();var main=document.querySelector("main");
    [].forEach.call(main.children,function(c){c.classList.remove("m-on");});
    if(!s){root.setAttribute("data-svc","list");main.querySelector(".page-hero").classList.add("m-on");main.querySelector(".m-svc-list").classList.add("m-on");setHeader("Services",false);}
    else{root.setAttribute("data-svc",s.id);var sec=document.getElementById(s.sec||s.id);if(sec)sec.classList.add("m-on");
      if(s.tab){var t=document.getElementById(s.tab);if(t&&t.getAttribute("aria-selected")!=="true")t.click();}
      setHeader(s.t,true);}
    if(anim&&!reduced){main.classList.remove("m-swap");void main.offsetWidth;main.classList.add("m-swap");}
    top0();setTimeout(top0,80);setTimeout(top0,260);
  }
  function goSvc(id,anim){if(id)location.hash=id;else{history.pushState(null,"",location.pathname);renderSvc(anim);}}

  /* ---------- SIMULATION : choisir d'abord ce que l'on veut simuler ---------- */
  if(page==="demo"){
    var intro=document.getElementById("v-intro"),openBtn=document.getElementById("open-form");
    if(intro&&openBtn){
      var CH=[["Votre secrétaire IA","phone","Secrétaire IA",["Secrétaire IA","Réservation ou prise de rendez-vous"]],["Marketing IA","mega","Marketing sur les réseaux",["Agent marketing IA"]],["Gestion web app","layers","Gestion de contenu",["Gestion de la web app par IA"]],["Création de web app","home","Création d'une web app",["Web app sur mesure"]],["Projet complet","spark","Projet combiné",["Web app sur mesure","Agent marketing IA","Secrétaire IA","Gestion de la web app par IA"]]];
      var box=el("div","m-choose",'<p class="m-choose-t">Que souhaitez-vous simuler ?</p><div class="m-choose-g">'+CH.map(function(c,i){return '<button type="button" data-c="'+i+'"><span class="m-svc-ic">'+A.icon(c[1])+"</span><b>"+c[0]+"</b></button>";}).join("")+'</div><p class="m-choose-n">Vous préciserez ensuite votre projet, étape par étape.</p>');
      var host=openBtn.closest(".actions")||openBtn.parentNode;host.parentNode.insertBefore(box,host);
      box.addEventListener("click",function(e){var b=e.target.closest("button[data-c]");if(!b)return;var c=CH[+b.dataset.c];
        openBtn.click();
        setTimeout(function(){
          var pt=[].filter.call(document.querySelectorAll('input[name="ptype"]'),function(x){return x.value===c[2];})[0];if(pt&&!document.querySelector('input[name="ptype"]:checked')){pt.checked=true;pt.dispatchEvent(new Event("change",{bubbles:true}));}
          document.querySelectorAll('input[name="feat"]').forEach(function(x){if(c[3].indexOf(x.value)>=0&&!x.checked){x.checked=true;x.dispatchEvent(new Event("change",{bubbles:true}));}});
          top0();},60);});
    }
  }

  /* ---------- carrousels : points de position ---------- */
  document.querySelectorAll(".svc3,.sectors,.steps3").forEach(function(track){
    if(!track.children.length||track.children.length<2)return;
    var dots=el("div","m-dots");dots.setAttribute("aria-hidden","true");
    [].forEach.call(track.children,function(){dots.appendChild(el("i"));});
    track.parentNode.insertBefore(dots,track.nextSibling);
    function upd(){var w=track.children[0].getBoundingClientRect().width+12;var i=Math.round(track.scrollLeft/w);[].forEach.call(dots.children,function(d,k){d.classList.toggle("on",k===i);});}
    track.addEventListener("scroll",function(){requestAnimationFrame(upd);},{passive:true});upd();
  });

  /* ---------- transitions entre écrans ---------- */
  if(!reduced){
    document.addEventListener("click",function(e){var a=e.target.closest("a[href]");if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||a.target==="_blank"||a.hasAttribute("data-auth"))return;
      var href=a.getAttribute("href");if(!href||href.charAt(0)==="#"||/^(mailto|tel|https?):/i.test(href))return;
      var url=new URL(href,location.href);if(url.pathname===location.pathname)return;
      e.preventDefault();root.classList.add("m-leaving");setTimeout(function(){location.href=url.href;},150);});
  }
  /* chaque écran s'ouvre en haut (sauf ancre d'un contenu précis : question de FAQ, article juridique) */
  function keepAnchor(){var h=location.hash;if(!h)return false;if(page==="decouvrir"||page==="espace-client"||page==="home"||page==="demo"||page==="abonnements")return false;return !!document.getElementById(h.slice(1));}
  if(!keepAnchor()&&page!=="decouvrir"){top0();requestAnimationFrame(top0);setTimeout(top0,120);}
  addEventListener("pageshow",function(ev){root.classList.remove("m-leaving");if(ev.persisted&&!keepAnchor())top0();});
}

/* ---------- menus des onglets Aide et Informations légales ----------
   Ils s'ouvrent au-dessus de la barre, sans voile ni défilement bloqué ; un seul menu est ouvert à la fois. */
var HERE=location.pathname.split("/").pop()||"index.html";
function isCur(h){var p=h.split("#");return p[0]===HERE&&(p[1]||"")===(location.hash||"").slice(1);}
function helpItems(A){
  return HELP.map(function(h){
    return '<li><a href="'+h[0]+'"'+(isCur(h[0])?' aria-current="page"':"")+'><span class="m-help-ic">'+A.icon(h[3])+'</span><span class="m-help-l"><b>'+h[1]+"</b><small>"+h[2]+"</small></span>"+A.icon("chev","go")+"</a></li>";}).join("");}
function legalItems(A){
  var docs=A.legalDocs||[];
  return LEGAL.map(function(l){
    var d=docs.filter(function(x){return x[0]===l[0];})[0];var pdf=d?d[2]:"";var nom=d?d[3]:l[1];
    return '<li class="m-doc'+(isCur(l[0])?" is-cur":"")+'"><span class="m-help-ic">'+A.icon(l[2])+'</span><span class="m-doc-l"><b>'+l[1]+'</b><span class="m-doc-acts">'+
      '<a href="'+l[0]+'"'+(isCur(l[0])?' aria-current="page"':"")+' aria-label="Consulter '+nom+'">'+A.icon("eye")+"Consulter</a>"+
      (pdf?'<a href="docs/'+pdf+'" download="'+pdf+'" type="application/pdf" aria-label="Télécharger '+nom+' en PDF">'+A.icon("download")+"Télécharger en PDF</a>":"")+
      "</span></span></li>";}).join("")+
    '<li><button type="button" class="m-consent" data-m-consent><span class="m-help-ic">'+A.icon("gear")+'</span><span class="m-help-l"><b>Gestion du consentement</b><small>Modifier vos choix de cookies</small></span>'+A.icon("chev","go")+"</button></li>";}
var MENUS=[];
function popMenu(btn,id,title,items){
  if(!btn)return;
  var box=el("div","m-help");box.id=id;box.hidden=true;
  box.innerHTML='<div class="m-help-in"><p class="m-help-t" id="'+id+'-t">'+title+'</p><ul aria-labelledby="'+id+'-t">'+items+"</ul></div>";
  document.body.appendChild(box);
  var open=false,y0=0,timer=null;
  var api={hide:function(back){hide(back);}};MENUS.push(api);
  function place(){var r=btn.getBoundingClientRect(),b=box.getBoundingClientRect();
    box.style.setProperty("--cx",Math.max(18,Math.min(b.width-18,r.left+r.width/2-b.left))+"px");}
  function show(){if(open)return;MENUS.forEach(function(m){if(m!==api)m.hide(false);});
    open=true;clearTimeout(timer);box.hidden=false;place();y0=window.scrollY;
    btn.setAttribute("aria-expanded","true");
    void box.offsetWidth;box.setAttribute("data-open","");
    var first=box.querySelector("a,button");if(first)first.focus({preventScroll:true});}
  function hide(back){if(!open)return;open=false;btn.setAttribute("aria-expanded","false");box.removeAttribute("data-open");
    timer=setTimeout(function(){if(!open)box.hidden=true;},reduced?0:240);
    if(back)btn.focus({preventScroll:true});}
  btn.addEventListener("click",function(){if(open)hide(false);else show();});
  document.addEventListener("pointerdown",function(e){if(open&&!box.contains(e.target)&&!btn.contains(e.target))hide(false);},true);
  document.addEventListener("keydown",function(e){if(open&&e.key==="Escape"){e.preventDefault();hide(true);}});
  box.addEventListener("click",function(e){
    if(e.target.closest("[data-m-consent]")){hide(false);window.AXIA.consent.open();return;}   /* panneau des préférences cookies */
    var a=e.target.closest("a");if(!a)return;hide(false);
    if(a.hasAttribute("download"))return;
    /* entrée déjà affichée (même page, même ancre) : on remonte simplement à la section */
    if(isCur(a.getAttribute("href"))){e.preventDefault();var t=location.hash&&document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView({block:"start",behavior:reduced?"auto":"smooth"});else window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});}});
  box.addEventListener("focusout",function(e){if(open&&e.relatedTarget&&!box.contains(e.relatedTarget)&&e.relatedTarget!==btn)hide(false);});
  window.addEventListener("hashchange",function(){hide(false);[].forEach.call(box.querySelectorAll("a[href]"),function(a){if(isCur(a.getAttribute("href")))a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});});
  window.addEventListener("scroll",function(){if(open&&Math.abs(window.scrollY-y0)>40)hide(false);},{passive:true});
  window.addEventListener("resize",function(){if(open)place();});
  MQ.addEventListener&&MQ.addEventListener("change",function(){if(!MQ.matches)hide(false);});
}

/* PWA : enregistrement du service worker uniquement sur un vrai domaine en https, hors cadre. */
function pwa(){try{if("serviceWorker" in navigator&&location.protocol==="https:"&&window.self===window.top&&window.AXIA_CONFIG&&window.AXIA_CONFIG.pwa!==false){navigator.serviceWorker.register("sw.js").catch(function(){});}}catch(e){}}

function start(){if(MQ.matches)build();pwa();}
if(window.AXIA&&document.querySelector(".top"))start();else document.addEventListener("axia:ready",start);
})();
