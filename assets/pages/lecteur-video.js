/* Vision Plus — lecteur vidéo commun (page « Offre sur mesure » et rubrique « Secrétariat médical IA »).
   Chaque lecteur : <figure class="vp" data-config="…/video.json"> (voir offre-sur-mesure.html). Configuration sans code :
   vidéo source, miniature, et par langue : vidéo localisée, doublage synchronisé, sous-titres WebVTT, miniature.
   data-admin="offre" : les réglages du back-office (rubrique « Vidéo de l’offre », VISIONPLUS.content.video()) passent avant le fichier.
   La langue suit le sélecteur du site (événement vp:lang) : piste audio doublée si elle existe, sinon audio d’origine
   et sous-titres traduits, avec la langue audio indiquée. Changement de langue : même position, même état
   (pause ou lecture). Jamais de lecture automatique. Clavier : espace ou K, flèches, M, C, F. */
(function(){
"use strict";
var A=window.VISIONPLUS||{},D=document;
[].forEach.call(D.querySelectorAll(".vp[data-config]"),function(box){
var v=box.querySelector("video"),dub=box.querySelector("audio"),big=box.querySelector(".vp-big"),bar=box.querySelector(".vp-bar");
var $=function(s){return box.querySelector(s);};
var bPlay=$(".vp-play"),bMute=$(".vp-mute"),bCc=$(".vp-cc"),bFs=$(".vp-fs"),seek=$(".vp-seek"),vol=$(".vp-vol"),tNow=$(".vp-now"),tDur=$(".vp-dur"),cap=$(".vp-cap"),capT=$(".vp-cap span");
var RM=window.matchMedia("(prefers-reduced-motion: reduce)");
var M=null,lang="fr",cues=[],ccOn=false,ccUser=false,vidSrc="",dubOn=false,DUR=57,hasSubs=true;

/* ---------- configuration ---------- */
function merge(a,b){if(!b)return a;var o=JSON.parse(JSON.stringify(a));Object.keys(b).forEach(function(k){
  if(b[k]&&typeof b[k]==="object"&&!Array.isArray(b[k])&&o[k]&&typeof o[k]==="object")o[k]=merge(o[k],b[k]);else if(b[k]!==undefined)o[k]=b[k];});return o;}
function curLang(){var l=(window.VP_I18N&&window.VP_I18N.lang)||D.documentElement.lang||"fr";return l;}
function conf(l){return (M&&M.langues&&(M.langues[l]||M.langues[l.split("-")[0]]))||{};}
function exists(u){return u?fetch(u,{method:"HEAD",cache:"no-cache"}).then(function(r){return r.ok;},function(){return false;}):Promise.resolve(false);}

/* ---------- temps ---------- */
function fmt(s){s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
function dur(){return isFinite(v.duration)&&v.duration>0?v.duration:DUR;}
function tick(){var d=dur(),t=v.currentTime||0;tNow.textContent=fmt(t);tDur.textContent=fmt(d);
  seek.value=String(Math.round(t/d*1000));seek.setAttribute("aria-valuetext",fmt(t)+" / "+fmt(d));
  box.style.setProperty("--vp-p",(t/d*100).toFixed(2)+"%");showCue(t);syncDub(false);}

/* ---------- sous-titres (rendus par le lecteur : visibles aussi en plein écran, posés sur les sous-titres incrustés) ---------- */
function parseVtt(txt){var out=[];String(txt).replace(/\r/g,"").split(/\n\n+/).forEach(function(b){
  var m=/(\d+:)?(\d+):(\d+)[.,](\d+)\s*-->\s*(\d+:)?(\d+):(\d+)[.,](\d+)/.exec(b);if(!m)return;
  var s=(+(m[1]||"0:").slice(0,-1))*3600+(+m[2])*60+(+m[3])+(+m[4])/1000,e=(+(m[5]||"0:").slice(0,-1))*3600+(+m[6])*60+(+m[7])+(+m[8])/1000;
  var lines=b.split("\n"),i=lines.findIndex(function(x){return x.indexOf("-->")>-1;});out.push({s:s,e:e,t:lines.slice(i+1).join(" ").trim()});});return out;}
var shown=null;
function showCue(t){var c=null;if(ccOn)for(var i=0;i<cues.length;i++){if(t>=cues[i].s&&t<cues[i].e){c=cues[i];break;}}
  if(c===shown)return;shown=c;cap.hidden=!c;capT.textContent=c?c.t:"";}
function loadCues(l){var c=conf(l),u=c.sous_titres,fb=conf("fr").sous_titres;
  if(!u&&!fb){cues=[];shown=undefined;showCue(0);return Promise.resolve();}
  return fetch(u||fb).then(function(r){if(!r.ok)throw 0;return r.text();}).catch(function(){return u&&fb?fetch(fb).then(function(r){return r.text();}):"";})
    .then(function(t){cues=parseVtt(t||"");shown=undefined;showCue(v.currentTime||0);
      /* piste native (plein écran du système sur iPhone) */
      [].slice.call(v.querySelectorAll("track")).forEach(function(tr){tr.remove();});
      var tr=D.createElement("track");tr.kind="captions";tr.srclang=l;tr.label=langName(l,l);tr.src=u||fb;v.appendChild(tr);
      try{tr.track.mode="hidden";}catch(e){}});}
function setCc(on,user){ccOn=on;if(user)ccUser=true;bCc.setAttribute("aria-pressed",on?"true":"false");box.classList.toggle("vp-cc-on",on);shown=undefined;showCue(v.currentTime||0);}

/* ---------- langue : vidéo localisée, doublage ou audio d’origine + sous-titres ---------- */
function langName(code,inLang){try{var n=new Intl.DisplayNames([inLang||curLang()],{type:"language"}).of(code);return n?n.charAt(0).toLocaleUpperCase(inLang||curLang())+n.slice(1):code;}catch(e){return code;}}
function info(audioLang,kind){var ui=curLang();
  $(".vp-a-name").textContent=langName(audioLang,ui);
  [].slice.call(box.querySelectorAll("[data-audio-kind]")).forEach(function(s){s.hidden=s.getAttribute("data-audio-kind")!==kind;});
  var subs=$(".vp-i-subs");subs.hidden=!hasSubs||!ccOn||audioLang===lang&&kind!=="original";
  $(".vp-s-name").textContent=langName(lang,ui);}
function apply(l,keep){
  lang=l;var c=conf(l),src=M.source||{},t=v.currentTime||0,playing=!v.paused&&!v.ended,started=box.classList.contains("vp-started");
  var want=c.video||src.video,poster=c.miniature||src.miniature;
  if(poster&&v.getAttribute("poster")!==poster)v.setAttribute("poster",poster);
  var bi=$(".vp-big img");if(poster&&bi.getAttribute("src")!==poster){bi.removeAttribute("srcset");bi.src=poster;}
  var ready=Promise.resolve();
  if(want&&want!==vidSrc){vidSrc=want;
    if(started||v.getAttribute("src")){ready=new Promise(function(ok){v.addEventListener("loadedmetadata",function(){try{v.currentTime=Math.min(t,dur()-.1);}catch(e){}ok();},{once:true});});
      v.src=want;v.load();}
    else v.setAttribute("src",want);}
  /* doublage : seulement avec la vidéo source (une vidéo localisée a déjà son propre son) */
  dubOn=!c.video&&!!c.doublage&&l!==(src.langue_audio||"fr");
  if(dubOn){if(dub.getAttribute("src")!==c.doublage){dub.src=c.doublage;dub.load();}v.muted=true;}
  else{if(dub.getAttribute("src")){dub.pause();dub.removeAttribute("src");dub.load();}v.muted=box.classList.contains("vp-muted");}
  var kind=c.video?"localisee":dubOn?"doublage":"original",audioLang=c.video||dubOn?l:(src.langue_audio||"fr");
  if(!ccUser)setCc(hasSubs&&(audioLang!==l||(!c.video&&!(conf(l).sous_titres_incrustes)&&l!==(src.langue_audio||"fr"))),false);
  info(audioLang,kind);
  loadCues(l);
  ready.then(function(){syncDub(true);if(keep&&playing){var p=v.play();if(p&&p.catch)p.catch(function(){});}});}

/* ---------- synchronisation du doublage avec l’image ---------- */
function syncDub(force){if(!dubOn||!dub.src)return;
  dub.volume=v.volume;dub.muted=box.classList.contains("vp-muted");dub.playbackRate=v.playbackRate;
  if(force||Math.abs(dub.currentTime-v.currentTime)>.3){try{dub.currentTime=v.currentTime;}catch(e){}}
  if(!v.paused&&dub.paused){var p=dub.play();if(p&&p.catch)p.catch(function(){});}else if(v.paused&&!dub.paused)dub.pause();}

/* ---------- commandes ---------- */
function start(){box.classList.add("vp-started");if(!v.getAttribute("src")&&vidSrc)v.src=vidSrc;var p=v.play();if(p&&p.catch)p.catch(function(){box.classList.add("vp-paused");});}
function toggle(){if(v.paused||v.ended)start();else v.pause();}
big.addEventListener("click",function(){start();bPlay.focus({preventScroll:true});});
bPlay.addEventListener("click",toggle);
v.addEventListener("click",toggle);
v.addEventListener("play",function(){box.classList.remove("vp-paused");box.classList.add("vp-playing","vp-started");bPlay.setAttribute("aria-label","Pause");syncDub(true);});
v.addEventListener("pause",function(){box.classList.add("vp-paused");box.classList.remove("vp-playing");bPlay.setAttribute("aria-label","Lire la vidéo");syncDub(false);});
v.addEventListener("ended",function(){box.classList.remove("vp-playing");box.classList.add("vp-paused","vp-ended");bPlay.setAttribute("aria-label","Lire la vidéo");});
v.addEventListener("seeked",function(){syncDub(true);});
v.addEventListener("ratechange",function(){syncDub(true);});
v.addEventListener("timeupdate",tick);
v.addEventListener("loadedmetadata",tick);
v.addEventListener("waiting",function(){box.classList.add("vp-wait");});
v.addEventListener("playing",function(){box.classList.remove("vp-wait","vp-ended");});
v.addEventListener("error",function(){box.classList.add("vp-error");});
seek.addEventListener("input",function(){var d=dur();v.currentTime=(+seek.value)/1000*d;box.classList.add("vp-started");tick();});
function setMute(m){box.classList.toggle("vp-muted",m);if(dubOn){v.muted=true;dub.muted=m;}else v.muted=m;
  bMute.setAttribute("aria-label",m?"Activer le son":"Couper le son");bMute.setAttribute("aria-pressed",m?"true":"false");}
bMute.addEventListener("click",function(){setMute(!box.classList.contains("vp-muted"));if(!box.classList.contains("vp-muted")&&v.volume===0){v.volume=.8;vol.value="80";}});
vol.addEventListener("input",function(){v.volume=(+vol.value)/100;dub.volume=v.volume;setMute(v.volume===0);box.style.setProperty("--vp-v",vol.value+"%");});
bCc.addEventListener("click",function(){setCc(!ccOn,true);info(dubOn||conf(lang).video?lang:((M&&M.source&&M.source.langue_audio)||"fr"),conf(lang).video?"localisee":dubOn?"doublage":"original");});
function fsEl(){return D.fullscreenElement||D.webkitFullscreenElement;}
bFs.addEventListener("click",function(){var f=box.querySelector(".vp-frame");
  if(fsEl()){(D.exitFullscreen||D.webkitExitFullscreen).call(D);return;}
  if(f.requestFullscreen)f.requestFullscreen().catch(function(){});
  else if(f.webkitRequestFullscreen)f.webkitRequestFullscreen();
  else if(v.webkitEnterFullscreen){try{var tr=v.textTracks[0];if(tr)tr.mode=ccOn?"showing":"hidden";}catch(e){}v.webkitEnterFullscreen();}});
function onFs(){var on=!!fsEl();box.classList.toggle("vp-fs-on",on);bFs.setAttribute("aria-label",on?"Quitter le plein écran":"Plein écran");}
D.addEventListener("fullscreenchange",onFs);D.addEventListener("webkitfullscreenchange",onFs);
/* clavier : quand le lecteur a le focus (hors champs de saisie) */
box.addEventListener("keydown",function(e){if(e.target===seek&&/Arrow|Home|End/.test(e.key))return;if(e.target===vol)return;
  var k=e.key.toLowerCase(),h=true;
  if(k===" "||k==="k"){if(e.target.tagName==="BUTTON"&&k===" ")return;toggle();}
  else if(k==="arrowright")v.currentTime=Math.min(dur(),v.currentTime+5);else if(k==="arrowleft")v.currentTime=Math.max(0,v.currentTime-5);
  else if(k==="m")bMute.click();else if(k==="c")bCc.click();else if(k==="f")bFs.click();else h=false;
  if(h)e.preventDefault();});
/* commandes visibles au survol, au clavier et à l’arrêt ; masquées pendant la lecture après 2,5 s d’inactivité */
var idle;function wake(){box.classList.remove("vp-idle");clearTimeout(idle);idle=setTimeout(function(){if(!v.paused&&!box.contains(D.activeElement))box.classList.add("vp-idle");},2500);}
["pointermove","pointerdown","focusin","keydown"].forEach(function(t){box.addEventListener(t,wake);});

/* ---------- démarrage ---------- */
var src0=v.querySelector("source");vidSrc=src0?src0.getAttribute("src"):"";
fetch(box.getAttribute("data-config"),{cache:"no-cache"}).then(function(r){return r.json();}).catch(function(){return null;}).then(function(m){
  var base=m||{source:{video:vidSrc,langue_audio:"fr",miniature:v.getAttribute("poster")},langues:{fr:{sous_titres:"assets/video/offre/sous-titres/fr.vtt",sous_titres_incrustes:true}}};
  var over=null;try{over=box.getAttribute("data-admin")==="offre"&&A.content&&A.content.video?A.content.video():null;}catch(e){}
  M=merge(base,over);DUR=(M.source&&M.source.duree)||DUR;
  var ti=$(".vp-title");if(M.titre&&ti)ti.textContent=M.titre;
  /* aucun sous-titre déclaré (vidéo laissée dans sa langue d’origine) : bouton des sous-titres masqué */
  var anySubs=Object.keys(M.langues||{}).some(function(l){return M.langues[l]&&M.langues[l].sous_titres;});bCc.hidden=!anySubs;hasSubs=anySubs;
  var bd=$(".vp-big-dur");if(bd)bd.textContent=fmt(DUR);
  tDur.textContent=fmt(DUR);
  /* les fichiers déclarés mais absents (doublage, vidéo localisée) sont ignorés : jamais de piste inexistante */
  var checks=[];Object.keys(M.langues||{}).forEach(function(l){["doublage","video","miniature"].forEach(function(k){var u=M.langues[l][k];if(u)checks.push(exists(u).then(function(ok){if(!ok)M.langues[l][k]=null;}));});});
  return Promise.all(checks);}).then(function(){apply(curLang(),false);tick();});
D.addEventListener("vp:lang",function(e){if(M)apply((e.detail&&e.detail.lang)||curLang(),true);});
setMute(false);box.style.setProperty("--vp-v","100%");
});
})();
