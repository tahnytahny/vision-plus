/* Vision Plus — socle commun : en-tête, pied de page, compte, données, assistant, cookies.
   En mode "prototype", tout est stocké dans le navigateur du visiteur (localStorage).
   En production, chaque fonction de VISIONPLUS.auth / VISIONPLUS.records appelle l'API serveur (voir ARCHITECTURE.md). */
(function(){
"use strict";
var CFG=window.VISIONPLUS_CONFIG||{mode:"prototype",security:{},oauth:{}};
var DATA=window.VISIONPLUS_DATA||{};
var SEC=Object.assign({maxLoginAttempts:5,lockMinutes:15,codeMinutes:10,resetLinkMinutes:30,sessionDays:30},CFG.security||{});
var PROTO=CFG.mode!=="production";
var A=window.VISIONPLUS={config:CFG,data:DATA,proto:PROTO};
/* anciennes ancres d'avant le changement de nom (5 novembre 2026) : redirigées vers les nouvelles */
(function(){var OLD={"#axia-simple":"#vision-plus-simple","#resiliation-axia":"#resiliation-prestataire"};
  if(OLD[location.hash])try{history.replaceState(null,"",location.pathname+location.search+OLD[location.hash]);}catch(e){}})();
function pageId(){var m=document.querySelector('meta[name="vp-page"]');return (m&&m.content)||(document.body&&document.body.dataset.page)||"";}
A.page=pageId;

/* ---------- utilitaires ---------- */
/* données du navigateur : préfixe « vp. ». Les données enregistrées avant le changement de nom du site
   (5 novembre 2026, ancien préfixe ci-dessous) sont reprises une fois, pour que personne ne perde son compte ni ses choix. */
var KP="vp.",OLD_KP="axia.";
(function migrate(){[["localStorage"],["sessionStorage"]].forEach(function(n){try{var s=window[n[0]],keys=[];
  for(var i=0;i<s.length;i++){var k=s.key(i);if(k&&k.indexOf(OLD_KP)===0)keys.push(k);}
  keys.forEach(function(k){var nk=KP+k.slice(OLD_KP.length);if(s.getItem(nk)==null)s.setItem(nk,s.getItem(k));s.removeItem(k);});}catch(e){}});})();
var mem={};
A.store={
  get:function(k,d){try{var v=localStorage.getItem(KP+k);return v==null?(k in mem?mem[k]:d):JSON.parse(v);}catch(e){return k in mem?mem[k]:d;}},
  set:function(k,v){mem[k]=v;try{localStorage.setItem(KP+k,JSON.stringify(v));}catch(e){}},
  del:function(k){delete mem[k];try{localStorage.removeItem(KP+k);}catch(e){}}
};
A.ss={
  get:function(k){try{return JSON.parse(sessionStorage.getItem(KP+k));}catch(e){return null;}},
  set:function(k,v){try{sessionStorage.setItem(KP+k,JSON.stringify(v));}catch(e){}},
  del:function(k){try{sessionStorage.removeItem(KP+k);}catch(e){}}
};
A.now=function(){return Date.now();};
A.uid=function(p){return (p||"id")+"_"+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);};
A.esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
A.norm=function(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9@.+ ]/g," ").replace(/\s+/g," ").trim();};
A.date=function(t,withTime){var d=new Date(t);var o={day:"numeric",month:"short",year:"numeric"};if(withTime){o.hour="2-digit";o.minute="2-digit";}var lg=document.documentElement.lang||"fr";lg=lg==="fr"?"fr-FR":/^(ar|fa|ur|hi|bn|mr|ne)$/.test(lg)?lg+"-u-nu-latn":lg;try{return d.toLocaleDateString(lg,o);}catch(e){return d.toLocaleDateString("fr-FR",o);}};
A.qs=function(k){return new URLSearchParams(location.search).get(k);};
A.icon=function(name,cls){return '<svg class="ico i-'+name+" "+(cls||"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICONS[name]||"")+"</svg>";};
var ICONS={
  chev:'<path d="m6 9 6 6 6-6"/>',eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',download:'<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',
  chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
  send:'<path d="M5 12h13M12 5l7 7-7 7"/>',spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  mega:'<path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M10 6c4 0 7-2 9-3v18c-2-1-5-3-9-3"/>',
  phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  layers:'<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',
  life:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',cube:'<path d="M12 2.8 3.8 7.4v9.2L12 21.2l8.2-4.6V7.4z"/><path d="M3.8 7.4 12 12l8.2-4.6M12 12v9.2"/>',
  helmet:'<path d="M2.5 17.5h19"/><path d="M4.5 17.5V15a7.5 7.5 0 0 1 15 0v2.5"/><path d="M10 8V5.5h4V8"/><path d="M8.2 9.6 7.3 13M15.8 9.6l.9 3.4"/>',headset:'<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.2" height="6.5" rx="1.6"/><rect x="16.8" y="14" width="4.2" height="6.5" rx="1.6"/><path d="M19 20.5c0 1.2-1.2 1.8-2.6 1.8H14"/>',uplus:'<circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>',folder:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  play:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  file:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',home:'<path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',warn:'<path d="M12 3 2 20h20zM12 10v4M12 17h.01"/>',check:'<path d="m5 12 5 5 9-10"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',clip:'<path d="m21 11-8.6 8.6a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8L15.5 7"/>',
  db:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  chart:'<path d="M3 3v18h18M7 15l4-4 3 3 6-7"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'
};

/* ---------- notifications visuelles ---------- */
A.toast=function(html,opt){opt=opt||{};var box=document.querySelector(".toasts");if(!box){box=document.createElement("div");box.className="toasts";box.setAttribute("role","status");box.setAttribute("aria-live","polite");document.body.appendChild(box);}
  var t=document.createElement("div");t.className="toast"+(opt.proto?" proto":"");t.innerHTML=html;box.appendChild(t);setTimeout(function(){t.remove();},opt.ms||(opt.proto?9000:4200));};

/* ---------- contenus administrables ---------- */
A.content={
  faq:function(){return A.store.get("faq",DATA.faq||[]);},
  setFaq:function(v){A.store.set("faq",v);A.audit("FAQ modifiée");},
  kb:function(){return A.store.get("kb",DATA.kb||[]);},
  setKb:function(v){A.store.set("kb",v);A.audit("Base de connaissances modifiée");},
  plans:function(){return A.store.get("plans",DATA.plans||[]);},
  setPlans:function(v){A.store.set("plans",v);A.audit("Formules modifiées");},
  legal:function(id){return A.store.get("legal."+id,null);},
  setLegal:function(id,v){A.store.set("legal."+id,v);A.audit("Document légal modifié : "+id);}
};

/* ---------- collections (projets, simulations, SAV, factures…) ---------- */
A.records={
  list:function(c,f){var l=A.store.get("rec."+c,[]);return f?l.filter(f):l;},
  get:function(c,id){return A.records.list(c).find(function(x){return x.id===id;})||null;},
  add:function(c,o){var l=A.records.list(c);o=Object.assign({id:A.uid(c.slice(0,3)),createdAt:A.now()},o);l.unshift(o);A.store.set("rec."+c,l);return o;},
  update:function(c,id,patch){var l=A.records.list(c),o=null;l=l.map(function(x){if(x.id===id){o=Object.assign({},x,patch,{updatedAt:A.now()});return o;}return x;});A.store.set("rec."+c,l);return o;},
  remove:function(c,id){A.store.set("rec."+c,A.records.list(c).filter(function(x){return x.id!==id;}));}
};
A.audit=function(action,detail){var u=A.auth&&A.auth.current();A.records.add("audit",{action:action,detail:detail||"",by:u?u.email||u.phone:"système"});};
A.notify=function(userId,title,body,link){if(!userId)return;A.records.add("notifications",{userId:userId,title:title,body:body||"",link:link||"",read:false});};
/* E-mails et SMS : en prototype, ils sont déposés dans la boîte d'envoi visible dans le back-office. */
A.send=function(channel,to,subject,body){A.records.add("outbox",{channel:channel,to:to,subject:subject,body:body});
  if(PROTO)A.toast("<b>Mode présentation</b> · "+(channel==="sms"?"SMS":"E-mail")+" à "+A.esc(to)+" : "+A.esc(subject),{proto:true});};

/* ---------- comptes ---------- */
function users(){return A.store.get("users",[]);}
function saveUsers(l){A.store.set("users",l);}
function findUser(f){return users().find(f)||null;}
async function hash(pw,salt){var b=new TextEncoder().encode(salt+":"+pw);var h=await crypto.subtle.digest("SHA-256",b);return Array.from(new Uint8Array(h)).map(function(x){return x.toString(16).padStart(2,"0");}).join("");}
function normPhone(p){p=String(p||"").replace(/[^\d+]/g,"");if(/^0\d{9}$/.test(p))p="+33"+p.slice(1);return p;}
function lockKey(id){return "lock."+A.norm(id);}
function locked(id){var l=A.store.get(lockKey(id),{n:0,until:0});return l.until>A.now()?Math.ceil((l.until-A.now())/60000):0;}
function fail(id){var l=A.store.get(lockKey(id),{n:0,until:0});l.n++;if(l.n>=SEC.maxLoginAttempts){l.until=A.now()+SEC.lockMinutes*60000;l.n=0;}A.store.set(lockKey(id),l);}
function clearFail(id){A.store.del(lockKey(id));}
function issueCode(purpose,target){var code=String(Math.floor(100000+Math.random()*900000));var codes=A.store.get("codes",{});codes[purpose+":"+target]={code:code,exp:A.now()+SEC.codeMinutes*60000,tries:0};A.store.set("codes",codes);return code;}
function checkCode(purpose,target,code){var codes=A.store.get("codes",{}),k=purpose+":"+target,c=codes[k];
  if(!c)return "Aucun code en cours. Demandez un nouveau code.";
  if(c.exp<A.now()){delete codes[k];A.store.set("codes",codes);return "Ce code a expiré. Demandez un nouveau code.";}
  if(c.tries>=5){delete codes[k];A.store.set("codes",codes);return "Trop d'essais. Demandez un nouveau code.";}
  if(String(code).trim()!==c.code){c.tries++;A.store.set("codes",codes);return "Code incorrect.";}
  delete codes[k];A.store.set("codes",codes);return null;}
function startSession(u,remember){var s={uid:u.id,exp:A.now()+(remember?SEC.sessionDays*864e5:12*36e5),remember:!!remember};
  if(remember)A.store.set("session",s);else{A.store.del("session");A.ss.set("session",s);}
  A.records.add("sessions",{userId:u.id,remember:!!remember,ua:navigator.userAgent.slice(0,80)});}
A.auth={
  normPhone:normPhone,
  current:function(){var s=A.store.get("session",null)||A.ss.get("session");if(!s||s.exp<A.now()){return null;}return findUser(function(u){return u.id===s.uid;});},
  isAdmin:function(){var u=A.auth.current();return !!(u&&u.role&&u.role!=="client");},
  strength:function(pw){var e=[];if(pw.length<10)e.push("10 caractères minimum");if(!/[a-z]/i.test(pw))e.push("une lettre");if(!/\d/.test(pw))e.push("un chiffre");return e;},
  signupEmail:async function(o){var email=String(o.email||"").trim().toLowerCase();
    if(findUser(function(u){return u.email===email;}))return {error:"Un compte existe déjà avec cette adresse. Connectez-vous ou réinitialisez votre mot de passe."};
    var salt=A.uid("s");var u={id:A.uid("usr"),name:o.name.trim(),email:email,phone:"",salt:salt,pw:await hash(o.password,salt),emailVerified:false,phoneVerified:false,providers:["email"],role:"client",createdAt:A.now(),prefs:{news:false,notifEmail:true,notifSms:false}};
    var l=users();l.push(u);saveUsers(l);var code=issueCode("verify-email",email);
    A.send("email",email,"Votre code de vérification Vision Plus : "+code,"Saisissez ce code pour confirmer votre adresse. Il est valable "+SEC.codeMinutes+" minutes.");
    A.audit("Compte créé",email);return {user:u};},
  resendEmailCode:function(email){var code=issueCode("verify-email",email);A.send("email",email,"Votre code de vérification Vision Plus : "+code,"Code valable "+SEC.codeMinutes+" minutes.");},
  verifyEmail:function(email,code,remember){var err=checkCode("verify-email",email,code);if(err)return {error:err};
    var l=users(),u=null;l.forEach(function(x){if(x.email===email){x.emailVerified=true;u=x;}});saveUsers(l);if(u)startSession(u,remember);return {user:u};},
  loginEmail:async function(email,pw,remember){email=String(email||"").trim().toLowerCase();var m=locked(email);
    if(m)return {error:"Trop de tentatives. Réessayez dans "+m+" min ou réinitialisez votre mot de passe."};
    var u=findUser(function(x){return x.email===email;});
    if(!u||!u.pw||u.pw!==await hash(pw,u.salt)){fail(email);return {error:"Adresse e-mail ou mot de passe incorrect."};}
    clearFail(email);if(u.suspended)return {error:"Ce compte est suspendu. Contactez le SAV."};if(!u.emailVerified){A.auth.resendEmailCode(email);return {needVerify:true,email:email};}
    startSession(u,remember);A.audit("Connexion",email);return {user:u};},
  phoneStart:function(phone){phone=normPhone(phone);if(!/^\+\d{8,15}$/.test(phone))return {error:"Numéro de téléphone invalide."};
    var m=locked(phone);if(m)return {error:"Trop de tentatives. Réessayez dans "+m+" min."};
    var exists=!!findUser(function(u){return u.phone===phone&&u.phoneVerified;});var code=issueCode("phone",phone);
    A.send("sms",phone,"Vision Plus : votre code est "+code,"Valable "+SEC.codeMinutes+" minutes. Ne le communiquez à personne.");return {phone:phone,exists:exists};},
  phoneVerify:function(phone,code,remember,name){phone=normPhone(phone);var err=checkCode("phone",phone,code);if(err){fail(phone);return {error:err};}
    clearFail(phone);var l=users(),u=l.find(function(x){return x.phone===phone;});
    if(!u){u={id:A.uid("usr"),name:(name||"").trim()||"Client Vision Plus",email:"",phone:phone,phoneVerified:true,emailVerified:false,providers:["phone"],role:"client",createdAt:A.now(),prefs:{news:false,notifEmail:false,notifSms:true}};l.push(u);A.audit("Compte créé",phone);}
    else{if(u.suspended)return {error:"Ce compte est suspendu. Contactez le SAV."};u.phoneVerified=true;}saveUsers(l);startSession(u,remember);return {user:u};},
  oauth:function(provider){if(!(CFG.oauth||{})[provider])return {error:"La connexion avec "+(provider==="apple"?"Apple":"Google")+" sera disponible dès que les identifiants auront été configurés sur le serveur Vision Plus. Utilisez l'e-mail ou le téléphone en attendant."};
    location.href=(CFG.apiBase||"")+"/auth/"+provider;return {};},
  logout:function(){A.store.del("session");A.ss.del("session");location.href="index.html";},
  resetRequest:function(channel,target){if(channel==="email"){target=String(target||"").trim().toLowerCase();var u=findUser(function(x){return x.email===target;});
      if(u){var tok=A.uid("rst");var r=A.store.get("resets",{});r[tok]={uid:u.id,exp:A.now()+SEC.resetLinkMinutes*60000};A.store.set("resets",r);
        A.send("email",target,"Réinitialisation de votre mot de passe Vision Plus","Lien valable "+SEC.resetLinkMinutes+" minutes : mot-de-passe.html?token="+tok);return {token:PROTO?tok:null};}
      return {};}
    target=normPhone(target);var u2=findUser(function(x){return x.phone===target;});if(u2){var code=issueCode("reset",target);A.send("sms",target,"Vision Plus : code de réinitialisation "+code,"Valable "+SEC.codeMinutes+" minutes.");}return {};},
  resetCheckToken:function(tok){var r=A.store.get("resets",{})[tok];return r&&r.exp>A.now()?r:null;},
  resetConfirm:async function(o){var l=users(),u=null;
    if(o.token){var r=A.store.get("resets",{}),t=r[o.token];if(!t||t.exp<A.now())return {error:"Ce lien a expiré. Faites une nouvelle demande."};u=l.find(function(x){return x.id===t.uid;});delete r[o.token];A.store.set("resets",r);}
    else{var ph=normPhone(o.phone);var err=checkCode("reset",ph,o.code);if(err)return {error:err};u=l.find(function(x){return x.phone===ph;});}
    if(!u)return {error:"Compte introuvable."};u.salt=A.uid("s");u.pw=await hash(o.password,u.salt);if(!u.providers.includes("email")&&u.email)u.providers.push("email");
    saveUsers(l);clearFail(u.email||u.phone);A.audit("Mot de passe réinitialisé",u.email||u.phone);return {user:u};},
  update:function(patch){var cur=A.auth.current();if(!cur)return null;var l=users(),u=null;l.forEach(function(x){if(x.id===cur.id){Object.assign(x,patch);u=x;}});saveUsers(l);return u;},
  changePassword:async function(oldPw,newPw){var cur=A.auth.current();if(cur.pw&&cur.pw!==await hash(oldPw,cur.salt))return {error:"Mot de passe actuel incorrect."};
    var salt=A.uid("s");A.auth.update({salt:salt,pw:await hash(newPw,salt)});A.audit("Mot de passe modifié",cur.email||cur.phone);return {};},
  require:function(){var u=A.auth.current();if(!u){location.replace("connexion.html?next="+encodeURIComponent(location.pathname.split("/").pop()+location.hash));return null;}return u;},
  allUsers:users,saveUsers:saveUsers
};

/* ---------- assistant (base de connaissances validée uniquement) ---------- */
var STOP="le la les un une des de du d l a au aux et ou en est ce que qui quoi comment je j me mon ma mes vous votre vos pour sur dans avec il y on pas ne se sa son ses peut puis faut faire".split(" ");
function toks(s){return A.norm(s).split(" ").filter(function(w){return w.length>1&&STOP.indexOf(w)<0;});}
A.assistant={
  suggestions:["Qu'est-ce que Vision Plus ?","Comment fonctionne la simulation ?","Comment obtenir une offre sur mesure ?","J'ai oublié mon mot de passe"],
  answer:function(q){var qt=toks(q);if(!qt.length)return {text:"Pouvez-vous préciser votre question ?",found:false};
    var pool=A.content.faq().map(function(f){return {q:f.q,a:f.a,status:f.status,link:f.link,tags:f.tags||""};}).concat(A.content.kb().map(function(k){return {q:k.q,a:k.a,status:"ok",link:k.link,tags:k.tags||""};}));
    var best=null,bs=0;pool.forEach(function(e){var hay=toks(e.q+" "+e.tags),s=0;qt.forEach(function(w){hay.forEach(function(h){if(h===w)s+=2;else if(h.length>3&&w.length>3&&(h.indexOf(w)===0||w.indexOf(h)===0))s+=1;});});s=s/Math.sqrt(hay.length+2);if(s>bs){bs=s;best=e;}});
    var u=A.auth.current();var res;
    if(!best||bs<0.45)res={text:"Je n'ai pas encore d'information validée pour répondre à cette question. Vous pouvez la poser à notre équipe : elle vous répondra directement.",link:"sav.html?from=assistant&q="+encodeURIComponent(q),linkLabel:"Ouvrir une demande SAV",found:false};
    else if(best.status!=="ok")res={text:DATA.pendingAnswer,link:best.link||("sav.html?from=assistant&q="+encodeURIComponent(q)),linkLabel:best.link?"Voir la page":"Contacter le SAV",found:true,pending:true};
    else res={text:best.a,link:best.link,linkLabel:"En savoir plus",found:true};
    A.records.add("conversations",{userId:u?u.id:null,q:q,a:res.text,found:res.found});
    return res;}
};

/* ---------- consentement cookies ---------- */
var CONSENT_V=1,CONSENT_MAX=182*864e5; /* choix redemandé au bout de 6 mois (recommandation CNIL) */
A.consent={
  get:function(){var c=A.store.get("consent",null);return c&&c.v===CONSENT_V&&(A.now()-c.date)<CONSENT_MAX?c:null;},
  set:function(o){var c={v:CONSENT_V,necessary:true,analytics:!!o.analytics,marketing:!!o.marketing,date:A.now()};A.store.set("consent",c);A.records.add("consents",{analytics:c.analytics,marketing:c.marketing});hideBanner();document.dispatchEvent(new CustomEvent("vp:consent",{detail:c}));A.toast("Vos préférences de cookies sont enregistrées.");},
  /* Charge un script non essentiel uniquement après consentement. */
  when:function(cat,fn){var c=A.consent.get();if(c&&c[cat])fn();else document.addEventListener("vp:consent",function(e){if(e.detail[cat])fn();});},
  open:function(){openPrefs();}
};
function hideBanner(){var b=document.querySelector(".cookie");if(b)b.remove();}
function banner(){if(A.consent.get()||document.querySelector(".cookie"))return;var d=document.createElement("section");d.className="cookie";d.setAttribute("aria-label","Cookies");
  d.innerHTML='<h2>Vos préférences de cookies</h2><p>Nous utilisons uniquement les cookies nécessaires au fonctionnement du site. Avec votre accord, nous pourrions aussi mesurer l\'audience et personnaliser les contenus. <a class="link" href="cookies.html">En savoir plus</a></p><div class="actions"><button class="btn btn-line" data-c="no">Tout refuser</button><button class="btn btn-line" data-c="yes">Tout accepter</button><button class="btn btn-ghost" data-c="custom">Personnaliser</button></div>';
  d.addEventListener("click",function(e){var b=e.target.closest("[data-c]");if(!b)return;var k=b.dataset.c;if(k==="yes")A.consent.set({analytics:true,marketing:true});else if(k==="no")A.consent.set({});else openPrefs();});
  document.body.appendChild(d);}
function openPrefs(){var c=A.consent.get()||{};var m=A.modal('<div class="modal-h"><div><h2 class="h-m">Gestion du consentement</h2><p class="mut small" style="margin-top:6px">Modifiable à tout moment depuis le pied de page.</p></div><button class="x" data-close aria-label="Fermer">'+A.icon("x")+'</button></div>'+
  '<div><div class="pref"><div><b>Nécessaires</b><p>Connexion, sécurité, mémorisation de vos choix. Toujours actifs.</p></div><label class="switch"><input type="checkbox" checked disabled aria-label="Cookies nécessaires"><span></span></label></div>'+
  '<div class="pref"><div><b>Mesure d\'audience</b><p>Statistiques de visite anonymisées. Aucun outil n\'est activé à ce jour.</p></div><label class="switch"><input type="checkbox" id="ck-a" '+(c.analytics?"checked":"")+' aria-label="Mesure d\'audience"><span></span></label></div>'+
  '<div class="pref"><div><b>Personnalisation et marketing</b><p>Contenus adaptés à vos centres d\'intérêt. Aucun outil n\'est activé à ce jour.</p></div><label class="switch"><input type="checkbox" id="ck-m" '+(c.marketing?"checked":"")+' aria-label="Marketing"><span></span></label></div></div>'+
  '<div class="actions"><button class="btn btn-line" id="ck-no">Tout refuser</button><button class="btn btn-cyan" id="ck-save">Enregistrer mes choix</button></div>');
  m.querySelector("#ck-no").onclick=function(){A.consent.set({});A.closeModal(m);};
  m.querySelector("#ck-save").onclick=function(){A.consent.set({analytics:m.querySelector("#ck-a").checked,marketing:m.querySelector("#ck-m").checked});A.closeModal(m);};}

/* ---------- modale ---------- */
A.modal=function(html){var m=document.createElement("div");m.className="modal";m.innerHTML='<div class="modal-in" role="dialog" aria-modal="true">'+html+"</div>";document.body.appendChild(m);
  var prev=document.activeElement;m._prev=prev;requestAnimationFrame(function(){m.setAttribute("data-open","");var f=m.querySelector("input:not([disabled]),button,select,textarea,a");if(f)f.focus();});
  m.addEventListener("click",function(e){if(e.target===m||e.target.closest("[data-close]"))A.closeModal(m);});
  m.addEventListener("keydown",function(e){if(e.key==="Escape")A.closeModal(m);});return m;};
A.closeModal=function(m){m.removeAttribute("data-open");setTimeout(function(){m.remove();},220);if(m._prev&&m._prev.focus)m._prev.focus();};

/* ---------- en-tête et pied de page ---------- */
var ACCT_ICON='<svg class="acct-ic" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="acg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9D7FA"/><stop offset=".55" stop-color="#1F77E9"/><stop offset="1" stop-color="#1661DF"/></linearGradient></defs><circle cx="16" cy="16" r="14.5" fill="none" stroke="url(#acg)" stroke-width="1.6"/><circle cx="16" cy="12.5" r="4.6" fill="none" stroke="url(#acg)" stroke-width="1.8"/><path d="M7.6 25.2c1.7-3.6 4.9-5.6 8.4-5.6s6.7 2 8.4 5.6" fill="none" stroke="url(#acg)" stroke-width="1.8" stroke-linecap="round"/><circle cx="25" cy="7" r="4.2" fill="#1F77E9" stroke="#101419" stroke-width="1.4"/><path d="M25 5v4M23 7h4" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/></svg>';
var DISCOVER=[{href:"decouvrir.html#agents",label:"Le service",sub:"Votre web app et trois agents IA",icon:"layers"},{id:"telephone-ia",href:"telephone-ia.html",label:"Votre secrétaire IA",sub:"Appels, rendez-vous, devis, e-mails",icon:"phone"},{href:"decouvrir.html#avantages",label:"Avantages",sub:"Ce que vous y gagnez",icon:"spark"},{href:"decouvrir.html#fonctionnement",label:"Fonctionnement",sub:"Comment les agents travaillent ensemble",icon:"chart"},{href:"decouvrir.html#secteurs",label:"Pour qui",sub:"Les métiers accompagnés",icon:"user"},{href:"decouvrir.html#commencer",label:"Commencer",sub:"Compte, simulation, offre sur mesure",icon:"arrow"}];
/* navigation ordinateur et tablette : « Découvrir » en une seule colonne (ordre demandé ; Marketing IA et Gestion de la web app, déjà présents sur le site, rejoignent les services) */
var NAV_DISCOVER=[{href:"decouvrir.html#agents",label:"Le service",icon:"layers"},{id:"telephone-ia",href:"telephone-ia.html",label:"Votre secrétaire IA",icon:"phone"},{href:"telephone-ia.html#secretariat-medical",label:"Secrétariat médical IA",icon:"shield"},{href:"campagne-ads.html#visibilite-sante",label:"Visibilité santé & esthétique",icon:"spark"},
  {href:"decouvrir.html#marketing",label:"Marketing IA",icon:"mega"},{href:"decouvrir.html#gestion",label:"Gestion de votre web app",icon:"gear"},
  {id:"demo",href:"demo.html",label:"Simulation",icon:"play"},{href:"decouvrir.html#avantages",label:"Avantages",icon:"spark"},
  {href:"decouvrir.html#fonctionnement",label:"Fonctionnement",icon:"chart"},{href:"decouvrir.html#secteurs",label:"Pour qui",icon:"user"},{href:"decouvrir.html#commencer",label:"Commencer",icon:"arrow"}];
var NAV=[{id:"demo",href:"demo.html",label:"Simulation"},{id:"offre",href:"offre-sur-mesure.html",label:"Offre sur mesure"}];
var HELP=[{id:"faq",href:"faq.html",label:"FAQ",sub:"Questions et réponses, posez la vôtre",icon:"help"},{id:"sav",href:"sav.html",label:"SAV / Assistance",sub:"Ouvrir et suivre une demande",icon:"life"}];
var ACCOUNT=[{h:"espace-client.html#tableau",l:"Tableau de bord",i:"home"},{h:"espace-client.html#profil",l:"Mon profil",i:"user"},{h:"espace-client.html#projets",l:"Mes projets",i:"folder"},{h:"espace-client.html#demos",l:"Mes simulations",i:"play"},{h:"espace-client.html#abonnement",l:"Mon offre",i:"card"},{h:"espace-client.html#factures",l:"Mes factures",i:"file"},{h:"espace-client.html#assistance",l:"Mon assistance",i:"life"},{h:"espace-client.html#parametres",l:"Paramètres",i:"gear"}];
function initials(n){return String(n||"A").trim().split(/\s+/).slice(0,2).map(function(w){return w[0];}).join("").toUpperCase();}
function ddItems(list,page){return list.map(function(h){return '<a href="'+h.href+'"'+(h.id&&h.id===page?' aria-current="page"':"")+">"+A.icon(h.icon)+"<span><b>"+h.label+"</b><small>"+h.sub+"</small></span></a>";}).join("");}
function dd(label,list,page,cur){return '<div class="dd'+(cur?" current":"")+'"><button type="button" aria-expanded="false" aria-haspopup="true">'+label+" "+A.icon("chev","chev")+'</button><div class="dd-menu">'+ddItems(list,page)+"</div></div>";}
/* ---------- ordinateur (761 px et plus) : menu « Menu » en haut à droite et bouton « Retour » ----------
   Le mobile (760 px et moins) garde sa barre d'onglets et son propre bouton retour (mobile.js) : ces éléments y sont masqués. */
/* compte dans l'en-tête, toujours visible : « Connexion » et « Créer un compte » (parcours existants : fenêtre A.authSheet, sinon pages connexion/inscription) ; une fois connecté, menu « Mon espace » */
function vAuth(u){
  if(u)return '<div class="vauth"><div class="dd dd-right vuser"><button type="button" class="user-btn" aria-expanded="false" aria-haspopup="true" aria-label="Mon espace client"><span class="avatar">'+A.esc(initials(u.name))+'</span><span class="user-n">'+A.esc(String(u.name||"").split(" ")[0])+"</span>"+A.icon("chev","chev")+'</button><div class="dd-menu">'+
    ACCOUNT.map(function(a){return '<a href="'+a.h+'">'+A.icon(a.i)+"<span><b>"+a.l+"</b></span></a>";}).join("")+'<hr><button type="button" data-logout>'+A.icon("out")+"<span><b>Déconnexion</b></span></button></div></div></div>";
  return '<div class="vauth"><a class="vbtn vbtn-ghost" href="connexion.html" data-auth="login" title="Connexion">'+A.icon("user")+'<span class="vbtn-l">Connexion</span></a>'+
    '<a class="vbtn vbtn-primary" href="inscription.html" data-auth="signup">'+A.icon("uplus")+'<span class="vbtn-l">Créer un compte</span></a></div>';}
/* en-tête sur une seule ligne tant qu'il tient ; sinon (tablette, fenêtre étroite) bouton de menu compact et navigation verticale */
function vFit(h){var inner=h.querySelector(".top-in"),mob=matchMedia("(max-width:760px)");if(!inner)return;
  /* trois paliers : barre complète avec icônes, barre sans icônes (écrans moyens), puis menu compact */
  /* débordement mesuré sur la position réelle des éléments (fiable aussi de droite à gauche) */
  function over(){var cs=getComputedStyle(inner),r=inner.getBoundingClientRect(),l=r.left+(parseFloat(cs.paddingLeft)||0)-1,rt=r.right-(parseFloat(cs.paddingRight)||0)+1,bad=false;
    [].forEach.call(inner.children,function(c){var b=c.getBoundingClientRect();if(!b.width||getComputedStyle(c).display==="none")return;if(b.left<l||b.right>rt)bad=true;});
    return bad||inner.scrollWidth>inner.clientWidth+1;}
  var tiers=["v-tight","v-tighter","v-tightest"];
  function fit(){var was=h.className;h.classList.remove("v-compact","v-tight","v-tighter","v-tightest");
    if(!mob.matches&&over()){var i=0;for(;i<tiers.length;i++){h.classList.add(tiers[i]);if(!over())break;}if(i===tiers.length)h.classList.add("v-compact");}
    if(h.className!==was)closeDd();}
  fit();var rt=0,later=function(){clearTimeout(rt);rt=setTimeout(fit,50);};window.addEventListener("resize",later);
  window.addEventListener("load",fit);document.addEventListener("vp:lang",later);new MutationObserver(later).observe(inner,{childList:true,subtree:true});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);}
/* « Retour » : page précédente du site si le visiteur vient d'une page de ce site, sinon l'accueil */
function fromSite(){try{if(history.length<2||!document.referrer)return false;var r=new URL(document.referrer),base=location.pathname.replace(/[^\/]*$/,"");
  return r.origin===location.origin&&r.pathname.indexOf(base)===0;}catch(x){return false;}}
function vBack(h,page){if(page==="home")return;var host=h.querySelector(".top-auth");if(!host)return;
  var a=document.createElement("a");a.className="vback";a.href="index.html";a.setAttribute("aria-label","Retour à la page précédente");
  a.title="Retour";a.innerHTML=A.icon("arrow");
  a.addEventListener("click",function(e){if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(fromSite()){e.preventDefault();history.back();}});
  host.insertBefore(a,host.firstChild);}
/* accueil sur ordinateur : ouverture en haut de page (le mobile le fait dans mobile.js) ; sauf lien vers une section (#…) ou retour arrière */
function homeTop(page){if(page!=="home"||location.hash||matchMedia("(max-width:760px)").matches)return;
  var nt=((performance.getEntriesByType&&performance.getEntriesByType("navigation")[0])||{}).type;if(nt==="back_forward")return;
  var moved=false,stop=function(){moved=true;};["wheel","touchstart","keydown","mousedown"].forEach(function(t){window.addEventListener(t,stop,{once:true,passive:true});});
  var t0=function(){if(!moved&&window.scrollY)window.scrollTo(0,0);};t0();
  window.addEventListener("load",function(){t0();requestAnimationFrame(t0);setTimeout(t0,60);});}
function header(){var page=pageId();var u=A.auth.current();
  var nl=function(href,label,icon,cur){return '<a href="'+href+'"'+(cur?' aria-current="page"':"")+">"+A.icon(icon)+"<span>"+label+"</span></a>";};
  var nav=nl("index.html","Accueil","home",page==="home")+
    '<div class="dd dd-col'+(/^(decouvrir|telephone-ia|demo)$/.test(page)?" current":"")+'"><button type="button" aria-expanded="false" aria-haspopup="true">'+A.icon("layers")+"<span>Découvrir</span>"+A.icon("chev","chev")+'</button><div class="dd-menu">'+
      NAV_DISCOVER.map(function(d){return '<a href="'+d.href+'"'+(d.id&&d.id===page?' aria-current="page"':"")+">"+A.icon(d.icon)+"<span>"+d.label+"</span></a>";}).join("")+"</div></div>"+
    nl("artisan-os.html","Artisan OS","helmet",page==="artisan")+
    nl("campagne-ads","Campagne ADS","mega",page==="ads")+
    nl("offre-sur-mesure.html","Offre sur-mesure","cube",page==="offre")+nl("faq.html","FAQ","help",page==="faq")+nl("sav.html","SAV et Assistant","headset",page==="sav");
  var act;
  if(u){act='<div class="dd dd-left"><button type="button" class="user-btn" aria-expanded="false" aria-haspopup="true" aria-label="Mon espace client"><span class="avatar">'+A.esc(initials(u.name))+'</span><span class="user-n">'+A.esc(u.name.split(" ")[0])+"</span>"+A.icon("chev","chev")+'</button><div class="dd-menu">'+
      ACCOUNT.map(function(a){return '<a href="'+a.h+'">'+A.icon(a.i)+"<span><b>"+a.l+"</b></span></a>";}).join("")+'<hr><button type="button" data-logout>'+A.icon("out")+"<span><b>Déconnexion</b></span></button></div></div>";}
  else act='<div class="dd dd-left acct"><button type="button" class="acct-btn" aria-expanded="false" aria-haspopup="true" aria-label="Se connecter ou créer un compte" title="Se connecter ou créer un compte">'+ACCT_ICON+'<span class="acct-l">Compte</span>'+A.icon("chev","chev")+'</button><div class="dd-menu">'+
      '<p class="acct-h">Votre espace Vision Plus</p><a href="connexion.html" data-auth="login">'+A.icon("user")+'<span><b>Se connecter</b><small>Accéder à mon espace client</small></span></a>'+
      '<a href="inscription.html" data-auth="signup">'+A.icon("spark")+'<span><b>Créer un compte</b><small>Apple, Google, téléphone ou e-mail</small></span></a></div></div>';
  var h=document.createElement("header");h.className="top";
  h.innerHTML='<div class="wrap top-in"><div class="top-auth">'+act+'</div><a class="brand" href="index.html" aria-label="Vision Plus, accueil"><span class="logo3d"><img class="logo3d-full" src="assets/brand/vp-logo.webp" alt="" width="1131" height="200"><img class="logo3d-mark" src="assets/brand/vp-mark.webp" alt="" width="207" height="240"></span></a><div class="top-right"><nav class="nav" aria-label="Navigation principale">'+nav+'</nav><span class="vsep" aria-hidden="true"></span>'+vAuth(u)+'<button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false">'+A.icon("menu")+"</button></div></div>";
  var group=function(t,list){return '<details class="dgroup"'+(list.some(function(x){return x.id===page;})||(t==="Découvrir"&&page==="decouvrir")?" open":"")+"><summary>"+t+A.icon("chev","chev")+"</summary>"+list.map(function(n){return '<a class="dl sub" href="'+n.href+'"'+(n.id&&n.id===page?' aria-current="page"':"")+">"+n.label+A.icon("arrow")+"</a>";}).join("")+"</details>";};
  var dr=document.createElement("div");dr.className="drawer";dr.setAttribute("aria-hidden","true");
  dr.innerHTML='<div class="drawer-in" role="dialog" aria-modal="true" aria-label="Menu"><div class="drawer-h"><span class="sr">Vision Plus</span><span class="logo3d"><img class="logo3d-full" src="assets/brand/vp-logo.webp" alt="" width="1131" height="200"><img class="logo3d-mark" src="assets/brand/vp-mark.webp" alt="" width="207" height="240"></span><button class="x" type="button" data-close aria-label="Fermer le menu">'+A.icon("x")+"</button></div>"+
    '<a class="dl" href="index.html"'+(page==="home"?' aria-current="page"':"")+">Accueil"+A.icon("arrow")+"</a>"+group("Découvrir",NAV_DISCOVER)+
    [["artisan-os.html","Artisan OS","artisan"],["campagne-ads","Campagne ADS","ads"],["offre-sur-mesure.html","Offre sur-mesure","offre"],["faq.html","FAQ","faq"],["sav.html","SAV et Assistant","sav"]].map(function(n){return '<a class="dl" href="'+n[0]+'"'+(n[2]===page?' aria-current="page"':"")+">"+n[1]+A.icon("arrow")+"</a>";}).join("")+
    (u?group("Mon espace",ACCOUNT.map(function(a){return {href:a.h,label:a.l};}))+'<div class="actions"><button class="btn btn-line" data-logout>Déconnexion</button></div>'
      :'<details class="dgroup dacct" open><summary><span class="dacct-s">'+ACCT_ICON+'Compte</span>'+A.icon("chev","chev")+'</summary><a class="dl sub" href="connexion.html" data-auth="login">Se connecter'+A.icon("arrow")+'</a><a class="dl sub" href="inscription.html" data-auth="signup">Créer un compte'+A.icon("arrow")+'</a></details>')+"</div>";
  var slot=document.querySelector('[data-vp="header"]');if(slot)slot.replaceWith(h);else document.body.prepend(h);document.body.appendChild(dr);
  vBack(h,page);vFit(h);homeTop(page);
  var burger=h.querySelector(".burger");
  function openDr(o){if(o){dr.setAttribute("data-open","");dr.removeAttribute("aria-hidden");burger.setAttribute("aria-expanded","true");dr.querySelector(".x").focus();document.documentElement.style.overflow="hidden";}else{dr.removeAttribute("data-open");dr.setAttribute("aria-hidden","true");burger.setAttribute("aria-expanded","false");document.documentElement.style.overflow="";}}
  burger.onclick=function(){openDr(true);};dr.addEventListener("click",function(e){if(e.target===dr||e.target.closest("[data-close]")||e.target.closest("a"))openDr(false);});
  dr.addEventListener("keydown",function(e){if(e.key==="Escape"){openDr(false);burger.focus();}});
  var hoverable=matchMedia("(hover:hover) and (pointer:fine)").matches;
  h.querySelectorAll(".dd").forEach(function(d){var b=d.querySelector("button"),t=null;
    function open(){closeDd(d);d.setAttribute("data-open","");b.setAttribute("aria-expanded","true");}
    b.addEventListener("click",function(e){e.stopPropagation();if(d.hasAttribute("data-open")&&!d._hov)closeDd();else{open();d._hov=false;}});
    if(hoverable){d.addEventListener("mouseenter",function(){clearTimeout(t);open();d._hov=true;});d.addEventListener("mouseleave",function(){t=setTimeout(function(){if(d._hov){d._hov=false;closeDd();}},180);});}
    d.addEventListener("keydown",function(e){var items=[].slice.call(d.querySelectorAll(".dd-menu a,.dd-menu button"));var i=items.indexOf(document.activeElement);
      if(e.key==="ArrowDown"){e.preventDefault();if(!d.hasAttribute("data-open"))open();(items[i+1]||items[0]).focus();}
      else if(e.key==="ArrowUp"){e.preventDefault();(items[i-1]||items[items.length-1]).focus();}});
    d.addEventListener("focusout",function(e){if(!d.contains(e.relatedTarget)){d.removeAttribute("data-open");b.setAttribute("aria-expanded","false");}});});
  document.addEventListener("click",function(){closeDd();});document.addEventListener("keydown",function(e){if(e.key==="Escape"){var o=document.querySelector(".dd[data-open]");closeDd();if(o)o.querySelector("button").focus();}});
  document.querySelectorAll("[data-logout]").forEach(function(b){b.onclick=A.auth.logout;});
  document.addEventListener("click",function(e){var a=e.target.closest("[data-auth]");if(!a||e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();openDr(false);A.authSheet(a.dataset.auth);});
}
function closeDd(except){document.querySelectorAll(".dd[data-open]").forEach(function(d){if(d===except)return;d.removeAttribute("data-open");d._hov=false;d.querySelector("button").setAttribute("aria-expanded","false");});}

/* ---------- fenêtre de connexion / inscription ---------- */
A.authSheet=function(mode){var cfg=CFG.oauth||{};
  var m=A.modal('<div class="modal-h"><div class="sheet-brand"><img src="assets/brand/vp-mark.webp" alt="" width="207" height="240"><div><h2 class="h-m" id="as-t">Bienvenue sur Vision Plus</h2><p class="mut small">Réservé aux professionnels.</p></div></div><button class="x" data-close aria-label="Fermer">'+A.icon("x")+'</button></div>'+
    '<div class="tabs sheet-tabs" role="tablist" aria-label="Connexion ou inscription"><button class="tab" role="tab" id="as-tl" aria-selected="false" aria-controls="as-pl">Se connecter</button><button class="tab" role="tab" id="as-ts" aria-selected="false" aria-controls="as-ps">Créer un compte</button></div>'+
    '<div class="oauth"><button type="button" class="btn btn-line btn-block oa" data-oa="apple"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.4-.9-2.4-4.1zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>Continuer avec Apple</button>'+
    '<button type="button" class="btn btn-line btn-block oa" data-oa="google"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true" style="stroke:none"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"/></svg>Continuer avec Google</button>'+
    '<a class="btn btn-line btn-block" id="as-phone" href="connexion.html?tab=telephone">'+A.icon("phone")+'Continuer avec un numéro de téléphone</a>'+
    '<p class="msg-err" id="as-oaerr" role="alert" hidden></p></div>'+
    '<div class="or"><span>ou</span></div>'+
    '<div role="tabpanel" id="as-pl" aria-labelledby="as-tl"><form class="form" id="as-form" novalidate><div class="field"><label for="as-email">Adresse e-mail</label><input class="input" id="as-email" type="email" autocomplete="email" placeholder="vous@entreprise.fr"></div>'+
      '<div class="field"><div class="lbl-row"><label for="as-pw">Mot de passe</label><a class="link small" href="mot-de-passe.html">Mot de passe oublié ?</a></div><input class="input" id="as-pw" type="password" autocomplete="current-password"></div>'+
      '<label class="check" for="as-rem"><input type="checkbox" id="as-rem" checked>Rester connecté</label><p class="msg-err" id="as-err" role="alert" hidden></p><button class="btn btn-cyan btn-block" type="submit">Se connecter</button></form>'+
      '<p class="sheet-alt">Pas encore de compte ? <button type="button" class="link" data-switch="signup">Créer un nouveau compte</button></p></div>'+
    '<div role="tabpanel" id="as-ps" aria-labelledby="as-ts" hidden><a class="btn btn-cyan btn-block" href="inscription.html">'+A.icon("mail")+'Continuer avec une adresse e-mail</a>'+
      '<p class="sheet-alt">Déjà un compte ? <button type="button" class="link" data-switch="login">Se connecter</button></p></div>');
  m.querySelector(".modal-in").classList.add("sheet");m.querySelector(".modal-in").setAttribute("aria-labelledby","as-t");
  var tl=m.querySelector("#as-tl"),ts=m.querySelector("#as-ts");
  function sel(k){var login=k!=="signup";tl.setAttribute("aria-selected",login);ts.setAttribute("aria-selected",!login);tl.tabIndex=login?0:-1;ts.tabIndex=login?-1:0;
    m.querySelector("#as-pl").hidden=!login;m.querySelector("#as-ps").hidden=login;m.querySelector("#as-t").textContent=login?"Bon retour sur Vision Plus":"Créer votre compte Vision Plus";
    m.querySelector("#as-phone").setAttribute("href",(login?"connexion.html":"inscription.html")+"?tab=telephone");m.querySelector("#as-oaerr").hidden=true;}
  sel(mode);tl.onclick=function(){sel("login");};ts.onclick=function(){sel("signup");};
  [tl,ts].forEach(function(t){t.addEventListener("keydown",function(e){if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();var o=t===tl?ts:tl;sel(o===tl?"login":"signup");o.focus();}});});
  m.querySelectorAll("[data-switch]").forEach(function(b){b.onclick=function(){sel(b.dataset.switch);(b.dataset.switch==="login"?tl:ts).focus();};});
  m.querySelectorAll("[data-oa]").forEach(function(b){b.onclick=function(){var r=A.auth.oauth(b.dataset.oa),e=m.querySelector("#as-oaerr");if(r&&r.error){e.textContent=r.error;e.hidden=false;}};});
  m.querySelector("#as-form").addEventListener("submit",async function(e){e.preventDefault();var em=m.querySelector("#as-email").value.trim(),pw=m.querySelector("#as-pw").value,err=m.querySelector("#as-err");
    if(!em||!pw){err.textContent="Indiquez votre adresse e-mail et votre mot de passe.";err.hidden=false;return;}
    var r=await A.auth.loginEmail(em,pw,m.querySelector("#as-rem").checked);
    if(r.error){err.textContent=r.error;err.hidden=false;return;}
    if(r.needVerify){location.href="connexion.html?email="+encodeURIComponent(em);return;}
    location.href="espace-client.html#tableau";});
  return m;};
function footer(){var f=document.createElement("footer");f.className="foot";
  f.innerHTML='<div class="wrap"><div class="foot-grid"><div><a class="brand foot-brand" href="index.html" aria-label="Vision Plus, accueil"><span class="logo3d"><img class="logo3d-full" src="assets/brand/vp-logo.webp" alt="" width="1131" height="200"><img class="logo3d-mark" src="assets/brand/vp-mark.webp" alt="" width="207" height="240"></span></a><p>Une web app sur mesure et trois agents IA.<br>Toute votre activité connectée.</p></div>'+
  '<div><h2>Plateforme</h2><ul><li><a href="decouvrir.html#agents">Le service</a></li><li><a href="demo.html">Simulation</a></li><li><a href="offre-sur-mesure.html">Votre offre sur mesure</a></li><li><a href="inscription.html">Créer un compte</a></li></ul></div>'+
  '<div><h2>Aide</h2><ul><li><a href="faq.html">FAQ</a></li><li><a href="sav.html">Assistance</a></li><li><a href="sav.html#contact">Contact</a></li></ul></div>'+
  legalMenu()+'</div>'+
  '<div class="foot-bottom"><span>© '+new Date().getFullYear()+' Vision Plus, service exploité par AX TECH. Tous droits réservés.</span>'+(PROTO?'<span class="proto-tag">'+A.icon("info")+" Version de présentation : les données restent dans votre navigateur.</span>":"")+"</div></div>";
  var slot=document.querySelector('[data-vp="footer"]');if(slot)slot.replaceWith(f);else document.body.appendChild(f);
  f.querySelector("[data-consent]").onclick=openPrefs;
  legalMenuInit(f);}
/* ---------- pied de page : menu « Informations légales » ----------
   Ordinateur : s'ouvre au survol, reste ouvert tant que la souris ou le focus y est ; un clic le garde ouvert.
   Clavier : Entrée ou Espace ouvre et ferme, Échap ferme. Écran tactile : s'ouvre au toucher.
   Les PDF (docs/) sont générés par outils/generer-pdf-legaux.sh à partir des pages du site. */
var LEGAL_DOCS=[
  ["cgv.html","CGV","Vision-Plus-CGV.pdf","les conditions générales de vente"],
  ["mentions-legales.html","Mentions légales","Vision-Plus-Mentions-legales.pdf","les mentions légales"],
  ["confidentialite.html","Politique de confidentialité","Vision-Plus-Politique-de-confidentialite.pdf","la politique de confidentialité"],
  ["cookies.html","Politique de cookies","Vision-Plus-Politique-cookies.pdf","la politique de cookies"]
];
function legalMenu(){
  return '<div class="foot-legal"><h2><button type="button" class="foot-legal-btn" id="foot-legal-btn" aria-expanded="false" aria-controls="foot-legal-panel">Informations légales'+A.icon("chev","chev")+'</button></h2>'+
    '<div class="foot-legal-panel" id="foot-legal-panel" role="region" aria-labelledby="foot-legal-btn"><div class="foot-legal-in"><ul>'+
    LEGAL_DOCS.map(function(d){return '<li class="fl-doc"><span class="fl-name">'+d[1]+'</span><span class="fl-acts">'+
      '<a href="'+d[0]+'" aria-label="Consulter '+d[3]+'">'+A.icon("eye")+'Consulter</a>'+
      '<a href="docs/'+d[2]+'" download="'+d[2]+'" type="application/pdf" aria-label="Télécharger '+d[3]+' en PDF">'+A.icon("download")+'Télécharger en PDF</a></span></li>';}).join("")+
    '<li class="fl-consent"><button type="button" data-consent>'+A.icon("lock")+'Gestion du consentement</button></li></ul></div></div></div>';}
function legalMenuInit(f){
  var wrap=f.querySelector(".foot-legal");if(!wrap)return;
  var btn=wrap.querySelector(".foot-legal-btn"),panel=wrap.querySelector(".foot-legal-panel");
  var fine=matchMedia("(hover:hover) and (pointer:fine)"),pinned=false,hover=false,t=null;
  function isOpen(){return wrap.classList.contains("is-open");}
  function set(o){wrap.classList.toggle("is-open",o);btn.setAttribute("aria-expanded",o?"true":"false");if("inert" in panel)panel.inert=!o;}
  function later(){clearTimeout(t);t=setTimeout(function(){if(!pinned&&!hover&&!wrap.contains(document.activeElement))set(false);},380);}
  set(false);
  wrap.addEventListener("mouseenter",function(){if(!fine.matches)return;hover=true;clearTimeout(t);set(true);});
  wrap.addEventListener("mouseleave",function(){if(!fine.matches)return;hover=false;later();});
  btn.addEventListener("click",function(){
    if(isOpen()&&(pinned||!hover)){pinned=false;set(false);}   /* déjà ouvert par un clic : on referme */
    else{pinned=true;clearTimeout(t);set(true);}});            /* ouvert au survol ou fermé : on le garde ouvert */
  wrap.addEventListener("keydown",function(e){if(e.key==="Escape"&&isOpen()){e.preventDefault();pinned=false;hover=false;set(false);btn.focus();}});
  wrap.addEventListener("focusout",function(e){if(!wrap.contains(e.relatedTarget)){pinned=false;later();}});
  document.addEventListener("pointerdown",function(e){if(isOpen()&&!wrap.contains(e.target)){pinned=false;hover=false;set(false);}},true);}

/* ---------- chat flottant ---------- */
A.renderAnswer=function(r){return A.esc(r.text)+(r.link?'\n<a href="'+A.esc(r.link)+'">'+A.esc(r.linkLabel||"En savoir plus")+" →</a>":"");};
function chat(){if(document.querySelector('meta[name="vp-nochat"]'))return;
  /* bouton flottant : ouvre la zone de question de la FAQ unifiée */
  var fab=document.createElement("a");fab.className="chat-fab";fab.href="faq.html#question";fab.setAttribute("aria-label","Poser une question (FAQ)");fab.innerHTML=A.icon("chat");
  fab.onclick=function(e){if(pageId()==="faq"&&window.VISIONPLUS_FAQ_ASK){e.preventDefault();window.VISIONPLUS_FAQ_ASK();}};
  document.body.appendChild(fab);}

/* ---------- apparitions ---------- */
function reveal(){var els=[].slice.call(document.querySelectorAll(".reveal"));if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target);}});},{rootMargin:"0px 0px -8% 0px"});
  els.forEach(function(el){var r=el.getBoundingClientRect();if(r.top>innerHeight){el.classList.add("pre");io.observe(el);}});}

/* ---------- démarrage ---------- */
function boot(){header();footer();chat();banner();reveal();document.dispatchEvent(new Event("vp:ready"));}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
