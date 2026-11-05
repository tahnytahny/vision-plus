/* Vision Plus — script commun aux pages juridiques.
   1. Remplace les repères [À compléter] (data-field) par les informations saisies dans le back-office :
      VISIONPLUS.content.legal("mentions-legales").fields sert de base commune (identité de l'entreprise),
      VISIONPLUS.content.legal(<document>).fields la complète ou la remplace pour la page courante.
      Champs reconnus : raisonSociale forme capital siege rcs siren tva directeur hebergeur email telephone mediateur.
      Date de mise à jour : obj.updatedAt (horodatage ou texte) si présent.
   2. Construit le sommaire (numéroté, repliable sur mobile, suivi de la lecture).
   3. Ajoute les liens vers les autres documents.
   4. Cookies : affiche l'état du consentement et ouvre le panneau de préférences. */
(function(){
"use strict";
var A=window.VISIONPLUS;if(!A)return;
var main=document.getElementById("contenu");if(!main)return;
var docId=main.getAttribute("data-legal")||"";
var DOCS=[
  {id:"cgv",href:"cgv.html",t:"Conditions générales de vente",s:"Offre sur mesure, devis, paiement, résiliation"},
  {id:"mentions-legales",href:"mentions-legales.html",t:"Mentions légales",s:"Éditeur, hébergeur, crédits"},
  {id:"confidentialite",href:"confidentialite.html",t:"Politique de confidentialité",s:"Vos données et vos droits"},
  {id:"cookies",href:"cookies.html",t:"Politique cookies",s:"Traceurs et gestion du consentement"}
];
var FIELDS="raisonSociale forme capital siege rcs siren tva directeur hebergeur email telephone mediateur".split(" ");

/* ---------- 1. champs renseignés par le back-office ---------- */
function obj(id){var o=A.content.legal(id);return o&&typeof o==="object"?o:{};}
var base=obj("mentions-legales"),own=docId&&docId!=="mentions-legales"?obj(docId):{};
var fields=Object.assign({},base.fields||{},own.fields||{});
document.querySelectorAll("[data-field]").forEach(function(el){
  var k=el.getAttribute("data-field");if(FIELDS.indexOf(k)<0)return;
  var v=fields[k];if(v==null)return;v=String(v).trim();if(!v)return;
  el.textContent="";
  if(k==="email"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){var a=document.createElement("a");a.href="mailto:"+v;a.textContent=v;el.appendChild(a);}
  else if(k==="telephone"&&/^[+\d][\d\s.()-]{5,}$/.test(v)){var t=document.createElement("a");t.href="tel:"+v.replace(/[^\d+]/g,"");t.textContent=v;el.appendChild(t);}
  else el.textContent=v;
  el.classList.remove("todo");el.classList.add("filled");
});
var upd=own.updatedAt||(docId==="mentions-legales"?base.updatedAt:null);
var maj=document.getElementById("legal-maj");
if(upd&&maj){maj.textContent=typeof upd==="number"?A.date(upd):String(upd);maj.classList.remove("todo");maj.classList.add("filled");}

/* valeurs issues de la configuration publique (durées de sécurité) */
var SEC=Object.assign({maxLoginAttempts:5,lockMinutes:15,codeMinutes:10,resetLinkMinutes:30,sessionDays:30},(A.config&&A.config.security)||{});
document.querySelectorAll("[data-config]").forEach(function(el){var k=el.getAttribute("data-config");if(SEC[k]!=null)el.textContent=SEC[k];});
/* méthodes de connexion pas encore activées */
document.querySelectorAll("[data-oauth]").forEach(function(el){var p=el.getAttribute("data-oauth");el.hidden=!!((A.config&&A.config.oauth)||{})[p];});

/* compteur de repères restants */
var cnt=document.getElementById("todo-count");
if(cnt){var n=document.querySelectorAll(".legal-doc mark.todo").length;
  cnt.innerHTML=n?'<span class="count">'+n+" repère"+(n>1?"s":"")+" « À compléter »</span> "+(n>1?"restent":"reste")+" sur cette page.":"Tous les repères de cette page sont renseignés. La validation juridique reste nécessaire.";}

/* ---------- 2. sommaire ---------- */
var doc=document.querySelector(".legal-doc"),toc=document.getElementById("toc-list");
if(doc&&toc){
  var hs=[].slice.call(doc.querySelectorAll("h2[id]")),n2=0,links=[];
  hs.forEach(function(h){
    var num=!h.classList.contains("no-num");if(num)n2++;
    var li=document.createElement("li"),a=document.createElement("a");a.href="#"+h.id;
    if(!num&&h.closest(".validate"))a.className="pv";
    a.innerHTML='<span class="n">'+(num?n2+".":"!")+"</span><span>"+A.esc(h.textContent.trim())+"</span>";
    li.appendChild(a);toc.appendChild(li);links.push({h:h,a:a});
  });
  var det=document.getElementById("toc-d"),mq=matchMedia("(min-width:1024px)");
  function sync(){if(mq.matches)det.open=true;}
  sync();if(mq.addEventListener)mq.addEventListener("change",sync);
  toc.addEventListener("click",function(e){if(e.target.closest("a")&&!mq.matches)det.open=false;});
  if("IntersectionObserver" in window){
    var vis={};
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){vis[e.target.id]=e.isIntersecting;});
      var cur=null;for(var i=0;i<links.length;i++){if(vis[links[i].h.id]){cur=links[i];break;}}
      if(!cur)return;links.forEach(function(l){if(l===cur)l.a.setAttribute("aria-current","true");else l.a.removeAttribute("aria-current");});
      /* garde l'entrée active visible dans un sommaire plus haut que l'écran */
      var box=document.querySelector(".toc");
      if(mq.matches&&box.scrollHeight>box.clientHeight){var top=box.scrollTop,t=cur.a.getBoundingClientRect().top-box.getBoundingClientRect().top+top;
        if(t<top+40||t>top+box.clientHeight-80)box.scrollTop=Math.max(0,t-box.clientHeight/2);}
    },{rootMargin:"-90px 0px -65% 0px"});
    links.forEach(function(l){io.observe(l.h);});
  }
}

/* ---------- 3. autres documents ---------- */
var others=document.getElementById("others-list");
if(others){others.innerHTML=DOCS.filter(function(d){return d.id!==docId;}).map(function(d){
  return '<li><a href="'+d.href+'"><span><b>'+d.t+"</b><small>"+d.s+"</small></span>"+A.icon("arrow")+"</a></li>";}).join("");}

/* ---------- 4. cookies : état du consentement ---------- */
var st=document.getElementById("consent-state");
function yesNo(b){return b?'<span class="pill ok">Acceptée</span>':'<span class="pill">Refusée</span>';}
function renderConsent(){if(!st)return;var c=A.consent.get();
  if(!c){st.innerHTML='<li><span>Aucun choix enregistré sur ce navigateur.</span><span class="pill warn">En attente</span></li><li><span>Traceurs strictement nécessaires</span><span class="pill info">Toujours actifs</span></li>';return;}
  st.innerHTML='<li><span>Choix enregistré le</span><b>'+A.esc(A.date(c.date,true))+"</b></li>"+
    '<li><span>Traceurs strictement nécessaires</span><span class="pill info">Toujours actifs</span></li>'+
    "<li><span>Mesure d'audience</span>"+yesNo(c.analytics)+"</li>"+
    "<li><span>Personnalisation et marketing</span>"+yesNo(c.marketing)+"</li>";}
renderConsent();
document.addEventListener("vp:consent",renderConsent);
document.querySelectorAll("[data-open-consent]").forEach(function(b){b.addEventListener("click",function(){A.consent.open();});});
})();
