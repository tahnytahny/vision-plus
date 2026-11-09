/* Vision Plus — robot de l’accueil dans les en-têtes « Votre secrétaire IA » et « Secrétariat médical IA » (téléphone, ≤ 760 px).
   À l’arrivée sur la section (une fois) : le robot apparaît, salue de la main (mêmes 6 poses du bras que sur l’accueil) et sa bouche
   bouge pendant que sa bulle s’affiche ; ensuite il flotte et cligne des yeux (animations en pause hors écran).
   Un appui sur le robot lui fait dire le texte de sa bulle avec la voix du navigateur, dans la langue choisie sur le site ;
   un second appui l’arrête. Jamais de son sans appui. Mouvement réduit : pas d’apparition ni de geste, la voix reste disponible.
   Styles : robot-sections.css */
(function(){
"use strict";
var bots=document.querySelectorAll(".sbot");if(!bots.length)return;
var R=matchMedia("(prefers-reduced-motion: reduce)");
if(!R.matches&&"IntersectionObserver" in window)document.documentElement.classList.add("sbot-js");

function armSeq(b,seq,ms){var arm=b.querySelector(".sbot-arm");clearTimeout(b._armT);if(R.matches||!arm)return;var k=0;
  (function step(){arm.style.backgroundPositionX=(seq[k++]*20)+"%";if(k<seq.length)b._armT=setTimeout(step,ms);})();}
function wave(b){armSeq(b,[1,2,3,4,3,5,3,4,3,2,1,0],85);}
function nod(b){if(R.matches)return;b.classList.add("is-nod");setTimeout(function(){b.classList.remove("is-nod");},450);}
function talkFor(b,ms){b.classList.add("is-talking");clearTimeout(b._talkT);b._talkT=setTimeout(function(){if(!b._speaking)b.classList.remove("is-talking");},ms);}

/* arrivée sur la section */
if(document.documentElement.classList.contains("sbot-js")){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var b=e.target;
    b.classList.toggle("is-run",e.isIntersecting);
    if(e.isIntersecting&&e.intersectionRatio>=0.6&&!b.classList.contains("is-in")){
      b.classList.add("is-in");
      setTimeout(function(){wave(b);},450);
      setTimeout(function(){talkFor(b,1500);},700);
      setTimeout(function(){nod(b);},2400);
    }});},{threshold:[0,0.6]});
  [].forEach.call(bots,function(b){io.observe(b);});
}else [].forEach.call(bots,function(b){b.classList.add("is-in","is-run");});

/* voix : texte de la bulle (traduit s’il le faut), voix du navigateur dans la langue du site */
var S="speechSynthesis" in window&&"SpeechSynthesisUtterance" in window;
function lang(){return (document.documentElement.lang||"fr").split(/[-_]/)[0].toLowerCase();}
function voice(){if(!S)return null;var lp=lang();
  var vs=speechSynthesis.getVoices().filter(function(v){return new RegExp("^"+lp+"([-_]|$)","i").test(v.lang);});if(!vs.length)return null;
  function score(v){var n=v.name,s=0;if(/natural|neural|online/i.test(n))s+=8;if(/premium|enhanced|amélior/i.test(n))s+=6;
    if(/grandma|grandpa|eddy|flo\b|reed|rocko|sandy|shelley|jacques/i.test(n))s-=12;return s;}
  return vs.sort(function(a,c){return score(c)-score(a);})[0];}
if(S&&speechSynthesis.addEventListener)speechSynthesis.addEventListener("voiceschanged",function(){});
var current=null;
function stop(b){if(!b)return;b._speaking=false;b.classList.remove("is-talking");if(current===b)current=null;}
function speak(b){
  if(!S){wave(b);talkFor(b,1600);return;}
  var was=current===b;speechSynthesis.cancel();if(current)stop(current);if(was)return;
  var say=b.querySelector(".sbot-say");var u=new SpeechSynthesisUtterance((say&&say.textContent||"").trim());
  var v=voice();if(v){u.voice=v;u.lang=v.lang;}else u.lang=document.documentElement.lang||"fr";u.rate=1;u.pitch=1.05;
  u.onend=u.onerror=function(){stop(b);};
  current=b;b._speaking=true;b.classList.add("is-talking","is-in");wave(b);
  speechSynthesis.speak(u);}
[].forEach.call(bots,function(b){var c=b.querySelector(".sbot-char");if(c)c.addEventListener("click",function(){speak(b);});});
document.addEventListener("visibilitychange",function(){if(document.hidden&&current){speechSynthesis.cancel();stop(current);}});
document.addEventListener("vp:lang",function(){if(current){speechSynthesis.cancel();stop(current);}});
})();
