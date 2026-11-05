/* Vision Plus — outils communs aux pages de compte (inscription, connexion, mot de passe oublié).
   S'appuie uniquement sur l'API publique window.VISIONPLUS (assets/site.js). */
(function(){
"use strict";
var A=window.VISIONPLUS;
var PAGES="index decouvrir telephone-ia compte demo abonnements faq assistant sav connexion inscription mot-de-passe espace-client cgv mentions-legales confidentialite cookies".split(" ");
var X=window.AXAUTH={};

/* Destination après connexion : uniquement une page du site (pas de redirection ouverte). */
X.next=function(){var n=A.qs("next")||"";var m=/^([a-z-]+)\.html(\?[\w=&%.-]*)?(#[a-z]+)?$/.exec(n);
  if(m&&PAGES.indexOf(m[1])>=0&&m[1]!=="connexion"&&m[1]!=="inscription"&&m[1]!=="mot-de-passe")return n;
  return "espace-client.html#tableau";};
X.go=function(){location.href=X.next();};
X.keepNext=function(href){var n=A.qs("next");return n?href+(href.indexOf("?")<0?"?":"&")+"next="+encodeURIComponent(n):href;};
X.isEmail=function(s){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s||"").trim());};
X.isPhone=function(s){return /^\+\d{8,15}$/.test(A.auth.normPhone(s));};

X.msg=function(el,html,ok){el.className="form-msg "+(ok?"msg-ok":"msg-err");el.innerHTML=html||"";};
X.invalid=function(input,bad){if(bad)input.setAttribute("aria-invalid","true");else input.removeAttribute("aria-invalid");};
X.busy=function(btn,on){btn.classList.add("btn-spin");if(on){btn.setAttribute("aria-busy","true");btn.disabled=true;}else{btn.removeAttribute("aria-busy");btn.disabled=false;}};

var APPLE='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.5-1-2.5-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z"/></svg>';
var GOOGLE='<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

/* Boutons Apple / Google : appellent VISIONPLUS.auth.oauth et affichent l'erreur si non configuré. */
X.sso=function(box,msgEl){box.innerHTML='<button type="button" class="btn btn-sso" id="sso-apple">'+APPLE+'Continuer avec Apple</button><button type="button" class="btn btn-sso" id="sso-google">'+GOOGLE+'Continuer avec Google</button>';
  [["apple","#sso-apple"],["google","#sso-google"]].forEach(function(p){box.querySelector(p[1]).onclick=function(){var r=A.auth.oauth(p[0]);if(r&&r.error)X.msg(msgEl,A.esc(r.error));else X.msg(msgEl,"");};});};

/* Onglets accessibles (flèches gauche/droite). */
X.tabs=function(list,onChange){var tabs=[].slice.call(list.querySelectorAll('[role="tab"]'));
  function sel(t,focus){tabs.forEach(function(x){var on=x===t;x.setAttribute("aria-selected",on?"true":"false");x.tabIndex=on?0:-1;document.getElementById(x.getAttribute("aria-controls")).hidden=!on;});if(focus)t.focus();if(onChange)onChange(t);}
  tabs.forEach(function(t,i){t.addEventListener("click",function(){sel(t);});t.addEventListener("keydown",function(e){var j=null;if(e.key==="ArrowRight")j=(i+1)%tabs.length;else if(e.key==="ArrowLeft")j=(i-1+tabs.length)%tabs.length;else if(e.key==="Home")j=0;else if(e.key==="End")j=tabs.length-1;if(j!=null){e.preventDefault();sel(tabs[j],true);}});});
  return {select:function(id){var t=tabs.find(function(x){return x.id===id;});if(t)sel(t);}};};

/* Afficher / masquer le mot de passe. */
var EYE='<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
var EYE_OFF='<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>';
X.pwToggle=function(input){var b=document.createElement("button");b.type="button";b.className="pw-toggle";b.setAttribute("aria-controls",input.id);
  function set(show){input.type=show?"text":"password";b.setAttribute("aria-pressed",show?"true":"false");b.setAttribute("aria-label",show?"Masquer le mot de passe":"Afficher le mot de passe");b.innerHTML='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+(show?EYE_OFF:EYE)+"</svg>";}
  set(false);b.onclick=function(){set(input.type==="password");};input.parentNode.appendChild(b);};

/* Règles du mot de passe (VISIONPLUS.auth.strength) affichées en direct. */
var RULES=["10 caractères minimum","une lettre","un chiffre"];
X.rules=function(input,list){list.innerHTML=RULES.map(function(r,i){return '<li data-r="'+i+'">'+r+"</li>";}).join("");
  function upd(){var miss=A.auth.strength(input.value);list.querySelectorAll("li").forEach(function(li){li.classList.toggle("ok",miss.indexOf(RULES[+li.dataset.r])<0);});}
  input.addEventListener("input",upd);upd();};
X.pwError=function(pw){var miss=A.auth.strength(pw);return miss.length?"Le mot de passe doit contenir : "+miss.join(", ")+".":"";};

/* Bouton « Renvoyer le code » avec délai. */
X.cooldown=function(btn,sec,label){clearInterval(btn._t);var n=sec;btn.disabled=true;
  function tick(){if(n<=0){clearInterval(btn._t);btn.disabled=false;btn.textContent=label;return;}btn.textContent=label+" ("+n+" s)";n--;}
  tick();btn._t=setInterval(tick,1000);};

/* Champ code : chiffres uniquement, 6 caractères. */
document.addEventListener("input",function(e){if(e.target.getAttribute&&e.target.getAttribute("aria-invalid"))e.target.removeAttribute("aria-invalid");});
X.codeField=function(input){input.addEventListener("input",function(){var v=input.value.replace(/\D/g,"").slice(0,6);if(v!==input.value)input.value=v;X.invalid(input,false);});};
})();
