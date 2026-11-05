/* Vision Plus — assistant d'accueil de la page d'accueil.
   1. À chaque ouverture du site (pas au retour depuis une autre page du site) : le robot salue et présente Vision Plus à voix haute (bienvenue-vision-plus.mp4, voix naturelle
      enregistrée), le texte s'affiche en même temps dans une bulle, puis il propose les raccourcis (services, FAQ).
   2. Si le navigateur bloque le son automatique : animation et texte tout de suite, voix à la première interaction
      (sur mobile : dès que le visiteur touche le robot).
   2 bis. Mobile : toucher le robot (dans l'en-tête ou dans la carte) lance directement sa voix, sans bouton « Écouter » ;
      jamais deux lectures en même temps.
   3. Bouche calée sur le volume de l'enregistrement (ENV) ; surlignage et gestes calés sur ses segments (SEG).
   4. Commandes discrètes : couper le son (choix mémorisé et respecté), arrêter la présentation, réduire le robot
      dans l'en-tête, où il ne recouvre aucun contenu.
   Repli : voix du navigateur si le fichier audio ne peut pas être lu. Rien n'est envoyé à un serveur.
   Règle : ne présenter que des fonctions réellement disponibles ou clairement configurables. */
(function(){
"use strict";
var A=window.VISIONPLUS;if(!A||document.querySelector(".axbot"))return;
var ST_KEY="assistant.home",st=A.store.get(ST_KEY,{})||{};
var MQ_M=matchMedia("(max-width:760px)"),MQ_R=matchMedia("(prefers-reduced-motion: reduce)");
function save(){A.store.set(ST_KEY,{muted:!!st.muted});}

/* ---------- texte lu : début de chaque segment dans bienvenue-vision-plus.mp4 (secondes), paragraphe, geste ---------- */
var SEG=[
  {t:0,p:0,s:"Bonjour et bienvenue sur Vision Plus !",g:"wave"},
  {t:2.44,p:0,s:"Moi, c'est votre assistant IA.",g:"nod"},
  {t:4.3,p:1,s:"Ici, vous pouvez créer votre web app et choisir des agents pour vous accompagner au quotidien :"},
  {t:8.64,p:1,s:"une secrétaire IA,",g:"present"},
  {t:9.82,p:1,s:"un agent marketing",g:"bounce"},
  {t:10.92,p:1,s:"et un agent pour gérer votre site.",g:"bounce"},
  {t:12.56,p:2,s:"Vous choisissez leurs missions",g:"rest"},
  {t:14.08,p:2,s:"et vous gardez le contrôle.",g:"nod"},
  {t:15.48,p:3,s:"Je vous fais découvrir ?",g:"hello"}
];
/* volume de la voix toutes les 40 ms (0 à 9), mesuré sur bienvenue-vision-plus.mp4 : la bouche le suit */
var ENV="589984559874321005974469755679784323424574323436977333210000009999841014343561375323316542105516873100000000079733222210497932847623367545922985994396701830894318733545943864454318637536226479758883396333386421000110048632421722874207733886642000465578464682176224555631111199865367646531199644548476257432201100000111107953372343225654574333455410000002873463268335953356418863310000000045981969629569521100";
var AUDIO="assets/assistant/bienvenue-vision-plus.mp4",IMG="assets/assistant/mascot-body.webp";
var SHORT=[["telephone","phone","Votre secrétaire IA"],["marketing","mega","Marketing IA"],["gestion","layers","Gestion de votre web app"],["faq","help","Poser une question dans la FAQ"]];
var IC={
  minus:'<path d="M6 12h12"/>',
  speak:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
  stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
  replay:'<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>'
};
function ic(n){return IC[n]?'<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+"</svg>":A.icon(n);}
function fig(withArm){return '<span class="ax-fig" aria-hidden="true"><img alt="" width="316" height="379" decoding="async">'+(withArm?'<span class="ax-arm"></span>':"")+
  '<span class="ax-face"><i class="ax-eye l"></i><i class="ax-eye r"></i><i class="ax-smile"></i><i class="ax-talk"></i></span></span>';}

/* ---------- panneau ---------- */
var root=document.createElement("aside");root.className="axbot";root.id="ax-panel";root.hidden=true;root.setAttribute("aria-label","Assistant Vision Plus");
root.innerHTML=
  '<div class="ax-bubble" role="dialog" aria-labelledby="ax-name">'+
    '<div class="ax-top"><span class="ax-name" id="ax-name">Assistant IA</span><div class="ax-tools">'+
      '<button type="button" class="ax-ic" data-act="mute"></button>'+
      '<button type="button" class="ax-ic" data-act="stop" aria-label="Arrêter la présentation" title="Arrêter la présentation" hidden>'+ic("stop")+"</button>"+
      '<button type="button" class="ax-ic" data-act="min" aria-label="Réduire l\'assistant dans l\'en-tête" title="Réduire">'+ic("minus")+"</button></div></div>"+
    '<div class="ax-txt" aria-live="polite"></div>'+
    '<p class="ax-hint">'+ic("speak")+'<span>Touchez le robot pour l\'écouter</span></p>'+
    '<div class="ax-more" hidden><p class="ax-more-t">Par où commencer ?</p><div class="ax-short">'+
      SHORT.map(function(s){return '<button type="button" class="ax-sc" data-go="'+s[0]+'">'+A.icon(s[1])+"<span>"+s[2]+"</span>"+A.icon("arrow")+"</button>";}).join("")+"</div>"+
      '<form class="ax-ask" action="faq.html" method="get" role="search"><label class="sr" for="ax-q">Votre question</label>'+
        '<input id="ax-q" name="q" type="text" maxlength="200" autocomplete="off" placeholder="Une question ? Posez-la ici">'+
        '<button type="submit" class="ax-send" aria-label="Envoyer la question à la FAQ">'+A.icon("send")+"</button></form>"+
      '<div class="ax-foot"><p class="ax-note">Réponse immédiate dans la FAQ.</p><button type="button" class="ax-chip" data-act="replay">'+ic("replay")+"Réécouter</button></div>"+
    "</div>"+
  "</div>"+
  '<div class="ax-char" aria-hidden="true"><span class="ax-glow"></span><span class="ax-float"><span class="ax-tilt">'+fig(true)+"</span></span></div>";
var txt=root.querySelector(".ax-txt"),more=root.querySelector(".ax-more"),arm=root.querySelector(".ax-arm"),bubble=root.querySelector(".ax-bubble"),
    bMute=root.querySelector('[data-act="mute"]'),bStop=root.querySelector('[data-act="stop"]');

/* ---------- au repos : pastille dans l'en-tête ---------- */
var dock=document.createElement("button");dock.type="button";dock.className="ax-dock";
dock.setAttribute("aria-controls","ax-panel");dock.setAttribute("aria-expanded","false");
dock.setAttribute("aria-label","Assistant Vision Plus : services et questions");dock.title="Assistant Vision Plus";dock.innerHTML=fig(false);
function placeDock(){var top=document.querySelector(".top-in"),auth=document.querySelector(".top-auth");if(!top)return;
  var host=MQ_M.matches||!auth?top:auth;if(dock.parentNode!==host)host.appendChild(dock);
  dock.setAttribute("aria-label",MQ_M.matches?"Écouter l'assistant Vision Plus":"Assistant Vision Plus : services et questions");}

/* ---------- affichage ---------- */
var view="";
function renderWelcome(){view="welcome";var ps=[[],[],[],[]];
  SEG.forEach(function(g,i){ps[g.p].push('<span class="ax-s" data-i="'+i+'">'+A.esc(g.s)+"</span>");});
  txt.innerHTML="<p>"+ps[0].join(" ")+"</p><p>"+ps[1].join(" ")+"</p><p>"+ps[2].join(" ")+"</p><p><strong>"+ps[3].join(" ")+"</strong></p>";
  more.hidden=true;}
function renderMenu(){view="menu";txt.innerHTML='<p class="ax-hello">Que souhaitez-vous découvrir ?</p>';more.hidden=false;more.querySelector(".ax-more-t").hidden=true;}
function reveal(){if(more.hidden){more.querySelector(".ax-more-t").hidden=false;more.hidden=false;}}
function tools(){
  bMute.setAttribute("aria-pressed",st.muted?"true":"false");
  bMute.setAttribute("aria-label",st.muted?"Réactiver le son":"Couper le son");bMute.title=st.muted?"Son coupé · réactiver":"Couper le son";
  bMute.innerHTML=ic(st.muted?"mute":"speak");
  bStop.hidden=!(playing||waiting);}
function isOpen(){return !root.hidden&&root.classList.contains("is-in");}
function open(v,byUser){
  if(v==="menu")renderMenu();else renderWelcome();
  root.hidden=false;dock.setAttribute("aria-expanded","true");tools();fitBanner();y0=v==="menu"?(window.scrollY||0):null;
  setTimeout(function(){root.classList.add("is-in");},20);
  if(byUser){var f=root.querySelector(".ax-more:not([hidden]) .ax-sc")||root.querySelector(".ax-tools button");if(f)f.focus({preventScroll:true});}}
function close(){
  halt();unlisten();var had=root.contains(document.activeElement);
  root.classList.remove("is-in");dock.setAttribute("aria-expanded","false");
  setTimeout(function(){if(!root.classList.contains("is-in"))root.hidden=true;},MQ_R.matches?0:320);
  if(!MQ_R.matches){dock.classList.remove("is-pop");void dock.offsetWidth;dock.classList.add("is-pop");}
  if(had)dock.focus({preventScroll:true});}

/* ---------- gestes : 6 poses rendues en 3D (0 repos, 1 bras tendu vers la bulle, 2-3 levé, 4-5 salut) ---------- */
var armF=0,armT=0;
function armSeq(seq,ms){clearTimeout(armT);if(MQ_R.matches||!seq.length)return;var k=0;
  (function step(){armF=seq[k++];arm.style.backgroundPositionX=(armF*20)+"%";if(k<seq.length)armT=setTimeout(step,ms);})();}
function toRest(){var seq=[];for(var f=Math.min(armF,3);f>=0;f--)seq.push(f);if(armF>3)seq.unshift(3);armSeq(seq,70);}
function nod(){if(MQ_R.matches)return;root.classList.add("is-nod");setTimeout(function(){root.classList.remove("is-nod");},450);}
function gesture(g){
  if(g==="wave")armSeq([1,2,3,4,3,5,3,4,3,2,1,0],85);
  else if(g==="present")armSeq([1],0);
  else if(g==="bounce")armSeq([2,1],130);
  else if(g==="rest")toRest();
  else if(g==="hello")armSeq([1,2,3,4,3,5,3],90);
  else if(g==="nod")nod();}

/* ---------- voix : enregistrement, sinon voix du navigateur ---------- */
var au=null,useAudio=false,playing=false,waiting=false,raf=0,seg=-1,mouth=0,resumeOnShow=false;
(function(){var a=document.createElement("audio");
  if(a.canPlayType&&a.canPlayType('audio/mp4; codecs="mp4a.40.2"')){a.preload="auto";a.src=AUDIO;au=a;useAudio=true;
    a.addEventListener("ended",function(){finish();});}})();
var V={ok:"speechSynthesis" in window&&"SpeechSynthesisUtterance" in window,voice:null,i:0,token:0,timer:0};
function pickVoice(){
  var vs=speechSynthesis.getVoices().filter(function(v){return /^fr([-_]|$)/i.test(v.lang);});if(!vs.length)return null;
  function score(v){var n=v.name,s=0;
    if(/fr[-_]FR/i.test(v.lang))s+=4;
    if(/natural|neural|online/i.test(n))s+=8;
    if(/premium|enhanced|amélior/i.test(n))s+=6;
    if(/denise|vivienne|eloise|audrey|aurélie|marie|google|henri|remy|rémy/i.test(n))s+=3;
    if(/grandma|grandpa|eddy|flo\b|reed|rocko|sandy|shelley|jacques/i.test(n))s-=12;
    return s;}
  return vs.sort(function(a,b){return score(b)-score(a);})[0];}
if(V.ok){V.voice=pickVoice();speechSynthesis.addEventListener("voiceschanged",function(){V.voice=pickVoice();});}

function setSeg(i){seg=i;
  [].forEach.call(txt.querySelectorAll(".ax-s"),function(el){var k=+el.getAttribute("data-i");el.classList.toggle("is-now",k===i);el.classList.toggle("is-past",k<i);});
  /* bulle raccourcie (petit écran, bannière cookies) : la phrase lue reste visible */
  var now=txt.querySelector(".ax-s.is-now");
  if(now&&bubble.scrollHeight>bubble.clientHeight+4){var y=now.offsetTop,h=now.offsetHeight;
    if(y<bubble.scrollTop+40||y+h>bubble.scrollTop+bubble.clientHeight-12)bubble.scrollTo({top:Math.max(0,y-56),behavior:MQ_R.matches?"auto":"smooth"});}
  if(i>=0&&SEG[i].g)gesture(SEG[i].g);}
function onPlay(){playing=true;waiting=false;unlisten();more.hidden=true;root.classList.add("is-playing","is-talking");tools();
  if(useAudio){cancelAnimationFrame(raf);raf=requestAnimationFrame(sync);}}
/* calage sur l'enregistrement : segment en cours, gestes, ouverture de la bouche */
function sync(){
  if(!playing||!au)return;
  var t=au.currentTime,i=0;while(i<SEG.length-1&&t>=SEG[i+1].t-.04)i++;if(i!==seg)setSeg(i);
  var v=(ENV.charCodeAt(Math.min(ENV.length-1,Math.floor(t/.04)))-48)/9;mouth+=(v-mouth)*.55;
  if(!MQ_R.matches)root.style.setProperty("--m",(.1+.9*mouth).toFixed(3));
  raf=requestAnimationFrame(sync);}
function speak(){
  stopSpeech();seg=-1;
  if(useAudio){au.muted=!!st.muted;try{au.currentTime=0;}catch(e){}
    var p=au.play();
    if(p&&p.then)p.then(onPlay,function(e){if(e&&e.name==="NotAllowedError")listen();else{useAudio=false;speak();}});else onPlay();
    return;}
  if(!V.ok||!V.voice){reveal();return;}
  root.classList.add("is-tts");ttsSay(0);}
function ttsSay(i){
  if(i>=SEG.length){finish();return;}
  var u=new SpeechSynthesisUtterance(SEG[i].s.replace(/\bIA\b/g,"I A")),my=++V.token;
  u.voice=V.voice;u.lang=V.voice.lang;u.rate=1.02;u.pitch=1.04;
  u.onstart=function(){if(my!==V.token)return;clearTimeout(V.timer);if(!playing)onPlay();setSeg(i);};
  u.onend=function(){if(my===V.token)ttsSay(i+1);};
  u.onerror=function(e){if(my!==V.token)return;clearTimeout(V.timer);if(e.error==="not-allowed"&&!playing){V.token++;listen();}else ttsSay(i+1);};
  speechSynthesis.speak(u);
  /* certains navigateurs mettent la voix en attente sans erreur : on considère alors le son bloqué */
  if(i===0&&!playing){clearTimeout(V.timer);V.timer=setTimeout(function(){if(!playing&&my===V.token){V.token++;speechSynthesis.cancel();listen();}},1800);}}
function stopSpeech(){V.token++;clearTimeout(V.timer);if(V.ok)try{speechSynthesis.cancel();}catch(e){}if(au&&!au.paused)au.pause();}
/* fin naturelle ou arrêt : le robot baisse le bras et propose les raccourcis */
function finish(){
  playing=false;cancelAnimationFrame(raf);stopSpeech();
  root.classList.remove("is-playing","is-talking","is-tts");root.style.removeProperty("--m");
  [].forEach.call(txt.querySelectorAll(".ax-s"),function(el){el.classList.remove("is-now","is-past");});
  toRest();reveal();tools();markScroll();}
function halt(){if(playing)finish();}

/* ---------- son bloqué : la voix démarre à la première interaction ---------- */
var EVTS=["pointerdown","keydown","touchend","click"];
function listen(){
  waiting=true;reveal();tools();markScroll();
  if(seg<0&&!MQ_R.matches)gesture("wave");
  if(MQ_M.matches){root.classList.add("is-waiting");return;}   /* mobile : la voix démarre dès que le visiteur touche le robot */
  if(!listen.on){listen.on=true;EVTS.forEach(function(t){document.addEventListener(t,onFirst,true);});}}
function unlisten(){waiting=false;root.classList.remove("is-waiting");if(listen.on){listen.on=false;EVTS.forEach(function(t){document.removeEventListener(t,onFirst,true);});}}
function onFirst(e){
  if(!waiting||playing)return;
  if(!isOpen()||st.muted){unlisten();tools();return;}
  if(e.type==="keydown"&&e.key==="Escape")return;
  if(e.target&&e.target.closest&&e.target.closest(".ax-tools,.ax-dock,.ax-more"))return;
  speak();}

/* ---------- raccourcis : onglet de la section « service » de l'accueil, sinon page dédiée ---------- */
var PAGES={telephone:"telephone-ia.html",marketing:"decouvrir.html#marketing",gestion:"decouvrir.html#gestion"};
function go(k){
  if(k==="faq"){halt();location.href="faq.html#question";return;}
  var tab=document.getElementById("tab-"+k),sec=document.getElementById("service");
  if(!tab||!sec||!sec.offsetParent){halt();location.href=PAGES[k]||"decouvrir.html";return;}
  close();tab.click();sec.scrollIntoView({behavior:MQ_R.matches?"auto":"smooth",block:"start"});
  setTimeout(function(){tab.focus({preventScroll:true});},MQ_R.matches?0:500);}

/* ---------- mobile : toucher le robot lance sa voix ---------- */
function playFromTouch(){
  if(playing)return;                                   /* déjà en train de parler : pas de seconde lecture */
  if(st.muted){st.muted=false;save();}                 /* le toucher vaut demande explicite d'écoute */
  if(!isOpen())open("welcome",false);else if(view!=="welcome")renderWelcome();
  unlisten();speak();}

/* ---------- événements ---------- */
dock.addEventListener("click",function(){
  if(MQ_M.matches){playFromTouch();return;}
  if(isOpen())close();else open("menu",true);});
root.querySelector(".ax-char").addEventListener("click",function(){if(MQ_M.matches)playFromTouch();});
root.addEventListener("click",function(e){
  var g=e.target.closest("[data-go]");if(g){go(g.getAttribute("data-go"));return;}
  var b=e.target.closest("[data-act]");if(!b)return;
  switch(b.getAttribute("data-act")){
    case "mute":st.muted=!st.muted;save();
      if(st.muted){unlisten();if(playing&&!useAudio)finish();else if(au)au.muted=true;}
      else if(au)au.muted=false;
      tools();break;
    case "stop":unlisten();halt();tools();break;
    case "min":close();break;
    case "replay":if(view!=="welcome")renderWelcome();if(st.muted){st.muted=false;save();}speak();break;}});
root.addEventListener("submit",function(e){var q=root.querySelector("#ax-q");if(!q.value.trim()){e.preventDefault();q.focus();return;}halt();});
root.addEventListener("keydown",function(e){if(e.key==="Escape"&&isOpen()){e.stopPropagation();close();}});
document.addEventListener("visibilitychange",function(){
  root.classList.toggle("ax-paused",document.hidden);dock.classList.toggle("ax-paused",document.hidden);
  if(document.hidden){if(playing&&useAudio&&!au.paused){au.pause();resumeOnShow=true;}else if(playing)finish();}
  else if(resumeOnShow){resumeOnShow=false;if(playing&&isOpen())au.play().catch(function(){finish();});}});
window.addEventListener("pagehide",function(){stopSpeech();});
/* hors lecture, le robot s'efface dans l'en-tête dès que le visiteur parcourt la page : il ne masque aucun contenu */
var y0=null,ty=0;
function markScroll(){y0=window.scrollY||0;}
window.addEventListener("scroll",function(){if(ty)return;ty=setTimeout(function(){ty=0;
  if(isOpen()&&!playing&&y0!=null&&Math.abs((window.scrollY||0)-y0)>160&&!root.contains(document.activeElement))close();},120);},{passive:true});
(MQ_M.addEventListener?MQ_M.addEventListener("change",placeDock):MQ_M.addListener(placeDock));

/* ---------- démarrage ---------- */
/* bannière cookies encore affichée (mobile, petit écran) : la bulle se place au-dessus d'elle, puis reprend sa place */
function fitBanner(){
  var c=document.querySelector(".cookie");root.style.bottom="";bubble.style.maxHeight="";
  if(!c||root.hidden)return;
  var cr=c.getBoundingClientRect(),pr=root.getBoundingClientRect();
  if(!cr.height||cr.left>=pr.right||cr.right<=pr.left)return;
  root.style.bottom=Math.round(innerHeight-cr.top+10)+"px";
  var head=document.querySelector(".top"),room=cr.top-10-(head?head.getBoundingClientRect().bottom:0)-(MQ_M.matches?root.querySelector(".ax-char").offsetHeight*.7:0)-8;
  bubble.style.maxHeight=Math.max(160,Math.round(room))+"px";}
document.addEventListener("vp:consent",function(){setTimeout(fitBanner,30);});
window.addEventListener("resize",function(){if(!root.hidden)fitBanner();});
/* retour à l'accueil depuis une autre page du site (lien interne ou bouton Précédent) : pas de nouvelle présentation */
function fromInside(){
  var nav=(performance.getEntriesByType&&performance.getEntriesByType("navigation")[0])||{};
  if(nav.type==="reload")return false;
  if(nav.type==="back_forward")return true;
  try{return !!document.referrer&&new URL(document.referrer).origin===location.origin;}catch(e){return false;}}
/* présentation automatique à chaque ouverture du site (nouvel onglet, lien extérieur, rechargement),
   sur ordinateur comme sur mobile */
function present(){
  if(fromInside())return;
  if(document.hidden){document.addEventListener("visibilitychange",function v(){if(!document.hidden){document.removeEventListener("visibilitychange",v);setTimeout(present,400);}});return;}
  open("welcome",false);
  if(st.muted){gesture("wave");reveal();tools();return;}
  speak();}
function start(){
  placeDock();document.body.appendChild(root);document.documentElement.classList.add("has-axbot");
  var imgs=[].slice.call(document.querySelectorAll(".axbot .ax-fig img,.ax-dock .ax-fig img")),n=imgs.length;
  imgs.forEach(function(im){im.onload=function(){if(--n===0)setTimeout(present,500);};im.src=IMG;});
  var pre=new Image();pre.src="assets/assistant/mascot-wave.webp";}
function idle(){("requestIdleCallback" in window)?requestIdleCallback(start,{timeout:1200}):setTimeout(start,200);}
if(document.readyState==="complete")idle();else window.addEventListener("load",idle);
})();
