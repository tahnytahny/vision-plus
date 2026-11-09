/* Vision Plus — espace client : routage par ancre (#tableau par défaut), une rubrique visible à la fois.
   Toutes les données passent par l'API publique window.VISIONPLUS (auth, records, content, consent). */
(function(){
"use strict";
var A=window.VISIONPLUS,D=A.data||{},esc=A.esc,ic=A.icon;
var me=A.auth.require();if(!me)return;

var NAV=[
  {g:"Vue d'ensemble"},
  {id:"tableau",l:"Tableau de bord",i:"home"},
  {id:"notifications",l:"Notifications",i:"bell"},
  {g:"Mon activité"},
  {id:"projets",l:"Projets",i:"folder"},
  {id:"demos",l:"Simulations",i:"play"},
  {id:"assistance",l:"Assistance",i:"life"},
  {id:"conversations",l:"Conversations IA",i:"chat"},
  {g:"Facturation"},
  {id:"abonnement",l:"Mon offre",i:"layers"},
  {id:"factures",l:"Factures",i:"file"},
  {id:"paiements",l:"Paiements",i:"card"},
  {g:"Mon compte"},
  {id:"profil",l:"Profil",i:"user"},
  {id:"securite",l:"Sécurité",i:"shield"},
  {id:"parametres",l:"Paramètres",i:"gear"},
  {id:"donnees",l:"Mes données",i:"db"}
];
var view=document.getElementById("view"),nav=document.getElementById("side-nav");

/* ---------- utilitaires ---------- */
function user(){var u=A.auth.current();if(!u){A.auth.require();throw new Error("Session expirée");}me=u;return u;}
function byDate(a,b){return (b.createdAt||0)-(a.createdAt||0);}
function mine(c){var u=me;return A.records.list(c,function(x){return x.userId===u.id;}).sort(byDate);}
function mineOrEmail(c){var u=me,em=(u.email||"").toLowerCase();return A.records.list(c,function(x){return x.userId===u.id||(!!em&&String(x.email||"").toLowerCase()===em);}).sort(byDate);}
function first(n){return String(n||"").trim().split(/\s+/)[0]||"";}
function initials(n){return String(n||"A").trim().split(/\s+/).slice(0,2).map(function(w){return w[0];}).join("").toUpperCase();}
function pill(cls,t){return '<span class="pill '+(cls||"")+'">'+esc(t)+"</span>";}
function money(v,cur){var n=Number(v);if(!isFinite(n))return esc(v);try{return new Intl.NumberFormat("fr-FR",{style:"currency",currency:cur||"EUR"}).format(n);}catch(e){return esc(n+" "+(cur||""));}}
function head(title,sub,actions){return '<div class="app-h"><div><h1 id="view-title" tabindex="-1">'+esc(title)+"</h1>"+(sub?"<p>"+sub+"</p>":"")+"</div>"+(actions?'<div class="actions">'+actions+"</div>":"")+"</div>";}
function empty(icon,title,text,actions){return '<div class="empty">'+ic(icon)+"<b>"+esc(title)+"</b>"+(text?"<p>"+text+"</p>":"")+(actions?'<div class="actions center">'+actions+"</div>":"")+"</div>";}
function modal(title,body,wide){var m=A.modal('<div class="modal-h"><div><h2 class="h-m" id="mdl-t">'+title+'</h2></div><button class="x" type="button" data-close aria-label="Fermer">'+ic("x")+"</button></div>"+body);
  var inn=m.querySelector(".modal-in");inn.setAttribute("aria-labelledby","mdl-t");if(wide)inn.classList.add("wide");return m;}
function remembered(){return !!A.store.get("session",null);}
function setMsg(el,text,ok){el.className="small "+(ok?"msg-ok":"msg-err");el.textContent=text||"";}
function isEmail(s){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s||"").trim());}
function safeUrl(u){u=String(u||"").trim();return /^(https?:\/\/|[a-z0-9_-]+\.(mp4|webm|m4v|mov)(\?.*)?$|assets\/)/i.test(u)?u:"";}
function safeLink(l){l=String(l||"");return /^(#[a-z]+|[a-z-]+\.html([?#][\w=&%#.-]*)?)$/.test(l)?l:"";}
function six(){return String(Math.floor(100000+Math.random()*900000));}
var TICKET_CLS={"Ouverte":"info","En cours":"info","En attente de votre réponse":"warn","Résolue":"ok","Fermée":""};
function ticketOpen(t){return t.status!=="Résolue"&&t.status!=="Fermée";}
function planName(id){var p=(A.content.plans()||[]).find(function(x){return x.id===id;});return p?p.name:"Offre sur mesure";}
function activeSub(){return mine("subscriptions").find(function(s){return s.status==="active"||s.status==="past_due";})||null;}
var SUB_ST={active:["ok","Actif"],past_due:["warn","Paiement en attente"],cancelled:["","Résilié"]};
function device(ua){ua=String(ua||"");var b=/Edg\//.test(ua)?"Edge":/Firefox\//.test(ua)?"Firefox":/Chrome\//.test(ua)?"Chrome":/Safari\//.test(ua)?"Safari":"Navigateur";
  var o=/iPhone|iPad/.test(ua)?"iOS":/Android/.test(ua)?"Android":/Mac OS X|Macintosh/.test(ua)?"macOS":/Windows/.test(ua)?"Windows":/Linux/.test(ua)?"Linux":"";return b+(o?" · "+o:"");}

/* ---------- menu latéral ---------- */
function counts(){var u=me;return {
  notif:A.records.list("notifications",function(n){return n.userId===u.id&&!n.read;}).length,
  wait:mineOrEmail("tickets").filter(function(t){return t.status==="En attente de votre réponse";}).length};}
function renderNav(cur){var c=counts();
  document.getElementById("who").innerHTML='<span class="avatar" aria-hidden="true">'+esc(initials(me.name))+"</span><div><b>"+esc(me.name)+"</b><small>"+esc(me.email||me.phone||"")+"</small></div>";
  nav.innerHTML=NAV.map(function(n){if(n.g)return '<p class="group">'+esc(n.g)+"</p>";
    var b=n.id==="notifications"?c.notif:n.id==="assistance"?c.wait:0;
    return '<a href="#'+n.id+'"'+(n.id===cur?' aria-current="page"':"")+">"+ic(n.i)+"<span>"+esc(n.l)+"</span>"+(b?'<span class="badge" aria-label="'+b+' nouveau'+(b>1?"x":"")+'">'+b+"</span>":"")+"</a>";}).join("")+
    '<div class="sep" aria-hidden="true"></div><button type="button" id="side-out">'+ic("out")+"<span>Se déconnecter</span></button>";
  document.getElementById("side-out").onclick=A.auth.logout;
  var a=nav.querySelector('[aria-current="page"]');if(a&&nav.scrollWidth>nav.clientWidth){nav.scrollLeft=a.offsetLeft-nav.clientWidth/2+a.offsetWidth/2;}}

/* ---------- rubriques ---------- */
var V={};

/* Tableau de bord */
V.tableau=function(){var u=me,demos=mineOrEmail("demos"),projects=mine("projects"),tickets=mineOrEmail("tickets"),
  unread=A.records.list("notifications",function(n){return n.userId===u.id&&!n.read;}).length,sub=activeSub();
  var openT=tickets.filter(ticketOpen),wait=tickets.filter(function(t){return t.status==="En attente de votre réponse";});
  var ready=demos.find(function(d){return d.status===3&&d.video;}),pending=demos.find(function(d){return d.status<3;});
  var unverified=(u.email&&!u.emailVerified)||(u.phone&&!u.phoneVerified);
  var n;
  if(wait.length)n={t:"L'équipe attend votre réponse",p:"Votre demande "+esc(wait[0].ref||"")+" est en attente de votre retour.",a:'<a class="btn btn-cyan" href="#assistance">Répondre '+ic("arrow","arrow")+"</a>"};
  else if(ready&&!sub)n={t:"Votre simulation est disponible",p:"Découvrez ce que Vision Plus fera pour votre projet, puis échangez avec un conseiller pour construire votre offre sur mesure.",a:'<a class="btn btn-cyan" href="#demos">Voir ma simulation '+ic("arrow","arrow")+'</a><a class="btn btn-ghost" href="offre-sur-mesure.html'+(ready.projectId?"?project="+encodeURIComponent(ready.projectId):"")+'#rappel">Demander un devis</a>'};
  else if(pending)n={t:"Votre simulation avance",p:"Statut actuel : "+esc((D.demoStatuses||[])[pending.status]||"")+". Vous serez notifié dès qu'elle sera disponible.",a:'<a class="btn btn-line" href="#demos">Suivre ma demande</a>'};
  else if(!demos.length)n={t:"Découvrez Vision Plus avec votre projet",p:"Présentez votre activité en quelques minutes et recevez une simulation vidéo personnalisée.",a:'<a class="btn btn-cyan" href="demo.html">Demander ma simulation '+ic("arrow","arrow")+"</a>"};
  else if(unverified)n={t:"Vérifiez vos coordonnées",p:"Une adresse ou un numéro vérifié protège votre compte.",a:'<a class="btn btn-line" href="#profil">Vérifier maintenant</a>'};
  else if(!sub)n={t:"Construisons votre offre",p:"Un conseiller Vision Plus étudie vos besoins avec vous et vous remet un devis personnalisé. La demande de rappel est sans engagement.",a:'<a class="btn btn-cyan" href="offre-sur-mesure.html#rappel">Parler à un conseiller '+ic("arrow","arrow")+"</a>"};
  else n={t:"Tout est en ordre",p:"Votre offre est en place. Besoin d'aide ? L'assistant et le SAV sont là.",a:'<a class="btn btn-line" href="faq.html#question">Poser une question</a>'};
  var protoBtn=A.proto?'<button type="button" class="btn btn-ghost btn-sm" id="sample">'+ic("spark")+" Données d'exemple</button>":"";
  view.innerHTML=head("Bonjour "+first(u.name),"Voici l'essentiel de votre compte.",protoBtn)+
    '<div class="kpis">'+
      '<a class="kpi" href="#demos"><b>'+demos.length+"</b><span>Simulation"+(demos.length>1?"s":"")+"</span></a>"+
      '<a class="kpi" href="#projets"><b>'+projects.length+"</b><span>Projet"+(projects.length>1?"s":"")+"</span></a>"+
      '<a class="kpi" href="#assistance"><b>'+openT.length+"</b><span>Demande"+(openT.length>1?"s":"")+" SAV ouverte"+(openT.length>1?"s":"")+"</span></a>"+
      '<a class="kpi" href="#notifications"><b>'+unread+"</b><span>Notification"+(unread>1?"s":"")+" non lue"+(unread>1?"s":"")+"</span></a>"+
    "</div>"+
    '<div class="next"><span class="eyebrow">Prochaine étape</span><h2>'+esc(n.t)+"</h2><p>"+n.p+'</p><div class="actions">'+n.a+"</div></div>";
  var s=document.getElementById("sample");if(s)s.onclick=sampleData;};

/* Profil et coordonnées */
V.profil=function(){var u=me;
  function contact(kind){var em=kind==="email",v=em?u.email:u.phone,ok=em?u.emailVerified:u.phoneVerified;
    return '<div class="contact">'+ic(em?"mail":"phone")+'<div class="v"><span>'+(em?"Adresse e-mail":"Téléphone")+"</span><b>"+(v?esc(v):'<span class="mut">Non renseigné</span>')+"</b></div>"+
      (v?pill(ok?"ok":"warn",ok?"Vérifié":"Non vérifié"):"")+
      '<div class="act">'+(v&&!ok?'<button type="button" class="btn btn-cyan btn-sm" data-verify="'+kind+'" id="verify-'+kind+'">Vérifier</button>':"")+
      '<button type="button" class="btn btn-line btn-sm" data-change="'+kind+'" id="change-'+kind+'">'+(v?"Modifier":"Ajouter")+"</button></div></div>";}
  view.innerHTML=head("Profil","Vos informations et vos coordonnées.")+
    '<div class="sec"><div class="sec-h"><h2>Informations</h2></div>'+
    '<form class="form narrow-form" id="f-profile" novalidate>'+
      '<div class="field"><label for="pf-name">Nom complet</label><input class="input" id="pf-name" autocomplete="name" value="'+esc(u.name)+'" required></div>'+
      '<div class="field"><label for="pf-company">Entreprise <small>(facultatif)</small></label><input class="input" id="pf-company" autocomplete="organization" value="'+esc(u.company||"")+'"></div>'+
      '<div class="field"><label for="pf-address">Adresse <small>(facultatif)</small></label><textarea class="input" id="pf-address" autocomplete="street-address" rows="3" style="min-height:90px">'+esc(u.address||"")+"</textarea></div>"+
      '<p id="pf-msg" class="small" aria-live="polite"></p>'+
      '<div class="actions"><button class="btn btn-cyan" type="submit" id="pf-save">Enregistrer</button></div></form></div>'+
    '<div class="sec"><div class="sec-h"><h2>Coordonnées</h2><p>Utilisées pour la connexion et les notifications.</p></div><div>'+contact("email")+contact("phone")+"</div></div>";
  document.getElementById("f-profile").addEventListener("submit",function(e){e.preventDefault();var nm=document.getElementById("pf-name"),msg=document.getElementById("pf-msg");
    if(!nm.value.trim()){nm.setAttribute("aria-invalid","true");setMsg(msg,"Indiquez votre nom.");nm.focus();return;}nm.removeAttribute("aria-invalid");
    A.auth.update({name:nm.value.trim(),company:document.getElementById("pf-company").value.trim(),address:document.getElementById("pf-address").value.trim()});
    me=A.auth.current();setMsg(msg,"Profil enregistré.",true);A.toast("Profil enregistré.");refreshHeader();renderNav("profil");});
  view.querySelectorAll("[data-verify]").forEach(function(b){b.onclick=function(){verifyFlow(b.dataset.verify,null);};});
  view.querySelectorAll("[data-change]").forEach(function(b){b.onclick=function(){changeFlow(b.dataset.change);};});};
function refreshHeader(){var a=document.querySelector(".user-btn .avatar"),s=document.querySelector(".user-btn .hide-sm");if(a)a.textContent=initials(me.name);if(s)s.textContent=first(me.name);}

/* Saisie d'une nouvelle adresse / d'un nouveau numéro, puis code */
function changeFlow(kind){var em=kind==="email";
  var m=modal(em?"Adresse e-mail":"Numéro de téléphone",'<form class="form" id="chg-f" novalidate><div class="field"><label for="chg-v">'+(em?"Nouvelle adresse e-mail":"Nouveau numéro de mobile")+'</label><input class="input" id="chg-v" '+(em?'type="email" autocomplete="email" inputmode="email"':'type="tel" autocomplete="tel" inputmode="tel" placeholder="06 12 34 56 78"')+' required></div><p class="small" id="chg-msg" aria-live="polite"></p><div class="actions"><button class="btn btn-cyan" type="submit">Recevoir un code</button><button class="btn btn-ghost" type="button" data-close>Annuler</button></div></form>');
  m.querySelector("#chg-f").addEventListener("submit",function(e){e.preventDefault();var inp=m.querySelector("#chg-v"),msg=m.querySelector("#chg-msg"),v=inp.value.trim();
    var all=A.auth.allUsers();
    if(em){v=v.toLowerCase();if(!isEmail(v)){setMsg(msg,"Saisissez une adresse e-mail valide.");inp.focus();return;}
      if(v===me.email&&me.emailVerified){setMsg(msg,"C'est déjà votre adresse.");return;}
      if(all.some(function(x){return x.id!==me.id&&x.email===v;})){setMsg(msg,"Cette adresse est déjà utilisée par un autre compte.");inp.focus();return;}}
    else{v=A.auth.normPhone(v);if(!/^\+\d{8,15}$/.test(v)){setMsg(msg,"Saisissez un numéro valide, par exemple 06 12 34 56 78.");inp.focus();return;}
      if(v===me.phone&&me.phoneVerified){setMsg(msg,"C'est déjà votre numéro.");return;}
      if(all.some(function(x){return x.id!==me.id&&x.phone===v;})){setMsg(msg,"Ce numéro est déjà utilisé par un autre compte.");inp.focus();return;}}
    A.closeModal(m);verifyFlow(kind,v);});}

/* Vérification par code. target=null : vérifier la coordonnée actuelle. */
function verifyFlow(kind,target){var em=kind==="email",prev={phone:me.phone,phoneVerified:me.phoneVerified},done=false;
  var v=target||(em?me.email:me.phone);
  if(em)A.auth.resendEmailCode(v);
  else{if(target)A.auth.update({phone:v,phoneVerified:false});var r=A.auth.phoneStart(v);if(r.error){if(target)A.auth.update(prev);A.toast(esc(r.error));return;}}
  var m=modal("Code de vérification",'<p class="mut">Saisissez le code à 6 chiffres envoyé à <b style="color:var(--ink);overflow-wrap:anywhere">'+esc(v)+'</b>.</p><form class="form" id="vf-f" novalidate><div class="field"><label for="vf-code">Code</label><input class="input" id="vf-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" style="font:600 1.5rem/1 var(--f-display);letter-spacing:.4em;text-align:center"></div><p class="small" id="vf-msg" aria-live="polite"></p><div class="actions"><button class="btn btn-cyan" type="submit">Valider</button><button class="btn btn-ghost" type="button" id="vf-resend">Renvoyer le code</button></div></form>');
  var rs=m.querySelector("#vf-resend"),inp=m.querySelector("#vf-code");
  function cool(){var n=30;rs.disabled=true;clearInterval(rs._t);rs.textContent="Renvoyer le code ("+n+" s)";rs._t=setInterval(function(){n--;if(n<=0||!rs.isConnected){clearInterval(rs._t);rs.disabled=false;rs.textContent="Renvoyer le code";}else rs.textContent="Renvoyer le code ("+n+" s)";},1000);}
  cool();inp.addEventListener("input",function(){inp.value=inp.value.replace(/\D/g,"").slice(0,6);});
  rs.onclick=function(){if(em)A.auth.resendEmailCode(v);else A.auth.phoneStart(v);setMsg(m.querySelector("#vf-msg"),"Nouveau code envoyé.",true);cool();};
  /* Annulation d'un changement de numéro non vérifié : on rétablit l'ancien numéro. */
  var obs=new MutationObserver(function(){if(!m.isConnected){obs.disconnect();if(!done&&!em&&target){A.auth.update(prev);me=A.auth.current();}}});obs.observe(document.body,{childList:true});
  m.querySelector("#vf-f").addEventListener("submit",function(e){e.preventDefault();var msg=m.querySelector("#vf-msg");
    if(!/^\d{6}$/.test(inp.value)){setMsg(msg,"Saisissez les 6 chiffres du code.");inp.focus();return;}
    var r=em?A.auth.verifyEmail(v,inp.value,remembered()):A.auth.phoneVerify(v,inp.value,remembered());
    if(r.error){setMsg(msg,r.error);inp.select();return;}
    if(em){A.auth.update({email:v,emailVerified:true});}
    done=true;me=A.auth.current();A.audit(em?"E-mail vérifié":"Téléphone vérifié",v);
    A.closeModal(m);A.toast(em?"Adresse e-mail vérifiée.":"Numéro vérifié.");render("profil");});}

/* Sécurité */
V.securite=function(){var u=me,hasPw=!!u.pw,oa=(A.config.oauth||{}),provs=u.providers||[];
  var sessions=mine("sessions").slice(0,8);
  function method(icon,label,state){return "<li><span>"+ic(icon)+esc(label)+"</span>"+state+"</li>";}
  /* mot de passe existant : un seul bouton ; on confirme d’abord le mot de passe actuel, puis on saisit le nouveau.
     Mot de passe actuel erroné : lien « Mot de passe oublié ? ». Sans mot de passe (compte SMS) : formulaire pour en définir un. */
  var pwForm=(!hasPw&&!u.email)?'<div class="notice info">'+ic("info")+'<span>Ajoutez d\'abord une adresse e-mail dans votre <a class="link" href="#profil">profil</a> pour pouvoir vous connecter avec un mot de passe.</span></div>':
    hasPw?'<div id="pw-zone"><div class="actions"><button class="btn btn-cyan" type="button" id="pw-start">Modifier le mot de passe</button></div></div>':
    '<form class="form narrow-form" id="f-pw" novalidate>'+
    '<div class="field"><label for="pw-new">Nouveau mot de passe</label><input class="input" id="pw-new" type="password" autocomplete="new-password" aria-describedby="pw-help" required><small id="pw-help">10 caractères minimum, avec au moins une lettre et un chiffre.</small></div>'+
    '<div class="field"><label for="pw-new2">Confirmation</label><input class="input" id="pw-new2" type="password" autocomplete="new-password" required></div>'+
    '<p id="pw-msg" class="small" aria-live="polite"></p><div class="actions"><button class="btn btn-cyan" type="submit">Définir un mot de passe</button></div></form>';
  view.innerHTML=head("Sécurité","Mot de passe, méthodes de connexion et sessions.")+
    '<div class="sec"><div class="sec-h"><h2>'+(hasPw?"Mot de passe":"Définir un mot de passe")+"</h2>"+(hasPw?"":"<p>Votre compte utilise aujourd'hui le code SMS.</p>")+"</div>"+pwForm+"</div>"+
    '<div class="sec"><div class="sec-h"><h2>Méthodes de connexion</h2></div><ul class="methods">'+
      method("mail","E-mail et mot de passe",hasPw&&u.email?pill("ok","Active"):pill("","Non configurée"))+
      method("phone","Téléphone et code SMS",u.phone&&u.phoneVerified?pill("ok","Active"):pill("","Non configurée"))+
      method("user","Apple",oa.apple?(provs.indexOf("apple")>=0?pill("ok","Liée"):pill("","Non liée")):pill("","Bientôt disponible"))+
      method("user","Google",oa.google?(provs.indexOf("google")>=0?pill("ok","Liée"):pill("","Non liée")):pill("","Bientôt disponible"))+
    "</ul></div>"+
    '<div class="sec"><div class="sec-h"><h2>Sessions récentes</h2><p>Les dernières connexions à votre compte.</p></div>'+
      (sessions.length?'<div class="tbl-wrap"><table class="tbl"><caption class="sr">Sessions récentes</caption><thead><tr><th scope="col">Date</th><th scope="col">Appareil</th><th scope="col">Rester connecté</th></tr></thead><tbody>'+
        sessions.map(function(s,i){return "<tr><td>"+esc(A.date(s.createdAt,true))+(i===0?' <span class="pill info" style="margin-left:6px">Dernière</span>':"")+"</td><td>"+esc(device(s.ua))+"</td><td>"+(s.remember?"Oui":"Non")+"</td></tr>";}).join("")+"</tbody></table></div>":
        empty("lock","Aucune session enregistrée",""))+
      '<div class="actions"><button type="button" class="btn btn-line" id="logout">'+ic("out")+" Se déconnecter</button></div></div>";
  document.getElementById("logout").onclick=A.auth.logout;
  /* nouveau mot de passe (étape 2, ou définition d’un premier mot de passe) */
  function newPwForm(oldPw){
    var f=document.getElementById("f-pw");if(!f)return;
    f.addEventListener("submit",async function(e){e.preventDefault();var msg=document.getElementById("pw-msg"),n1=document.getElementById("pw-new"),n2=document.getElementById("pw-new2");
      [n1,n2].forEach(function(x){x.removeAttribute("aria-invalid");});
      var miss=A.auth.strength(n1.value);if(miss.length){setMsg(msg,"Le nouveau mot de passe doit contenir : "+miss.join(", ")+".");n1.setAttribute("aria-invalid","true");n1.focus();return;}
      if(n1.value!==n2.value){setMsg(msg,"Les deux mots de passe ne correspondent pas.");n2.setAttribute("aria-invalid","true");n2.focus();return;}
      var r=await A.auth.changePassword(oldPw||"",n1.value);
      if(r.error){setMsg(msg,r.error);return;}
      if((me.providers||[]).indexOf("email")<0)A.auth.update({providers:(me.providers||[]).concat("email")});
      me=A.auth.current();A.toast(hasPw?"Mot de passe modifié.":"Mot de passe défini.");render("securite");});}
  newPwForm("");
  var zone=document.getElementById("pw-zone"),start=document.getElementById("pw-start");
  function cancelBtn(){return '<button class="btn btn-line" type="button" data-pw-cancel>Annuler</button>';}
  if(zone)zone.addEventListener("click",function(e){if(e.target.closest("[data-pw-cancel]"))render("securite");});
  if(start)start.addEventListener("click",function(){
    /* étape 1 : confirmer le mot de passe actuel */
    zone.innerHTML='<form class="form narrow-form" id="f-pw-check" novalidate><p class="small mut">Confirmez d’abord votre mot de passe actuel.</p>'+
      '<div class="field"><label for="pw-old">Mot de passe actuel</label><input class="input" id="pw-old" type="password" autocomplete="current-password" required></div>'+
      '<p id="pw-msg" class="small" aria-live="polite"></p><div class="actions"><button class="btn btn-cyan" type="submit">Valider</button>'+cancelBtn()+"</div></form>";
    var o=document.getElementById("pw-old");o.focus();
    document.getElementById("f-pw-check").addEventListener("submit",async function(e){e.preventDefault();var msg=document.getElementById("pw-msg");o.removeAttribute("aria-invalid");
      if(!o.value){setMsg(msg,"Saisissez votre mot de passe actuel.");o.setAttribute("aria-invalid","true");o.focus();return;}
      var r=await A.auth.checkPassword(o.value);
      if(!r.ok){var forgot="mot-de-passe.html"+(me.email?"?email="+encodeURIComponent(me.email):"");
        msg.className="small msg-err";msg.innerHTML=esc(r.error||"Mot de passe actuel incorrect.")+' <a class="link" href="'+esc(forgot)+'">Mot de passe oublié ?</a>';
        o.setAttribute("aria-invalid","true");o.select();return;}
      /* étape 2 : bon mot de passe, on choisit le nouveau */
      var old=o.value;
      zone.innerHTML='<form class="form narrow-form" id="f-pw" novalidate>'+
        '<div class="field"><label for="pw-new">Nouveau mot de passe</label><input class="input" id="pw-new" type="password" autocomplete="new-password" aria-describedby="pw-help" required><small id="pw-help">10 caractères minimum, avec au moins une lettre et un chiffre.</small></div>'+
        '<div class="field"><label for="pw-new2">Confirmation</label><input class="input" id="pw-new2" type="password" autocomplete="new-password" required></div>'+
        '<p id="pw-msg" class="small" aria-live="polite"></p><div class="actions"><button class="btn btn-cyan" type="submit">Enregistrer</button>'+cancelBtn()+"</div></form>";
      newPwForm(old);document.getElementById("pw-new").focus();});});};

/* Mon offre : offre sur mesure (étude des besoins, devis personnalisé), demandes de rappel */
V.abonnement=function(){var subs=mine("subscriptions").sort(function(a,b){return (b.start||b.createdAt||0)-(a.start||a.createdAt||0);}),cur=activeSub();
  var calls=mineOrEmail("rappels").sort(function(a,b){return (b.createdAt||0)-(a.createdAt||0);});
  function st(s){var x=SUB_ST[s.status]||["",s.status];return pill(x[0],x[1]);}
  var CTA='<a class="btn btn-cyan" href="offre-sur-mesure.html#rappel">Parler à un conseiller</a>';
  view.innerHTML=head("Mon offre","Votre offre Vision Plus est construite sur mesure avec un conseiller, puis précisée dans un devis personnalisé.",'<a class="btn btn-line btn-sm" href="offre-sur-mesure.html">Votre offre sur mesure</a>')+
    '<div class="sec">'+(cur?'<div class="next"><span class="eyebrow">Offre en cours</span><h2>'+esc(planName(cur.planId))+"</h2>"+st(cur)+
      '<dl class="kv"><dt>Depuis le</dt><dd>'+(cur.start?esc(A.date(cur.start)):"—")+"</dd><dt>"+(cur.status==="cancelled"?"Fin le":"Prochaine échéance")+"</dt><dd>"+(cur.renewAt?esc(A.date(cur.renewAt)):"—")+"</dd></dl>"+
      '<p class="sec-p">Le périmètre, les tarifs, la durée, le renouvellement et la résiliation de votre offre sont ceux du devis et des documents contractuels que vous avez acceptés.</p></div>':
      empty("layers","Aucune offre en cours","Un conseiller Vision Plus étudie vos besoins avec vous et vous remet un devis personnalisé. La demande de rappel est sans engagement.",CTA))+"</div>"+
    '<div class="sec"><div class="sec-h"><h2>Mes demandes de rappel</h2></div>'+(calls.length?'<ul class="rows">'+calls.map(function(c){
      return '<li><div class="row"><span class="row-main"><span class="ref">'+esc(c.ref||"")+'</span><span class="row-t">'+esc(c.company||"Demande de rappel")+'</span><span class="row-s">'+esc(["Rappel au "+(c.phone||"—"),A.date(c.createdAt)].join(" · "))+'</span></span><span class="row-side">'+pill(c.status==="Traitée"?"ok":"",c.status||"Reçue")+"</span></div></li>";}).join("")+"</ul>":
      '<p class="sec-p">Aucune demande de rappel pour le moment.</p>')+"</div>"+
    (subs.length?'<div class="sec"><div class="sec-h"><h2>Historique</h2></div><div class="tbl-wrap"><table class="tbl"><caption class="sr">Historique des offres</caption><thead><tr><th scope="col">Offre</th><th scope="col">Début</th><th scope="col">Échéance</th><th scope="col">Statut</th></tr></thead><tbody>'+
      subs.map(function(s){return "<tr><td>"+esc(planName(s.planId))+"</td><td>"+(s.start?esc(A.date(s.start)):"—")+"</td><td>"+(s.renewAt?esc(A.date(s.renewAt)):"—")+"</td><td>"+st(s)+"</td></tr>";}).join("")+"</tbody></table></div></div>":"");};

/* Factures */
V.factures=function(){var l=mine("invoices").sort(function(a,b){return (b.date||0)-(a.date||0);});
  view.innerHTML=head("Factures","Vos factures Vision Plus.")+'<div class="sec">'+(l.length?'<div class="tbl-wrap"><table class="tbl"><caption class="sr">Factures</caption><thead><tr><th scope="col">Numéro</th><th scope="col">Date</th><th scope="col">Offre</th><th scope="col" style="text-align:right">Montant</th><th scope="col">Statut</th></tr></thead><tbody>'+
    l.map(function(i){return "<tr><td>"+esc(i.number||"—")+"</td><td>"+(i.date?esc(A.date(i.date)):"—")+"</td><td>"+esc(i.planName||"—")+'</td><td class="num">'+money(i.amount,i.currency)+"</td><td>"+(i.status==="paid"?pill("ok","Payée"):i.status==="open"?pill("warn","À régler"):pill("",i.status||"—"))+"</td></tr>";}).join("")+"</tbody></table></div>":
    empty("file","Aucune facture","Vos factures apparaîtront ici après l'acceptation de votre devis."))+"</div>";};

/* Paiements */
V.paiements=function(){var l=mine("payments").sort(function(a,b){return (b.date||0)-(a.date||0);}),inv=A.records.list("invoices");
  var PS={paid:["ok","Réussi"],succeeded:["ok","Réussi"],failed:["bad","Échoué"],pending:["warn","En attente"],refunded:["","Remboursé"]};
  view.innerHTML=head("Paiements","L'historique de vos règlements.")+'<div class="sec">'+(l.length?'<div class="tbl-wrap"><table class="tbl"><caption class="sr">Paiements</caption><thead><tr><th scope="col">Date</th><th scope="col">Facture</th><th scope="col">Moyen</th><th scope="col" style="text-align:right">Montant</th><th scope="col">Statut</th></tr></thead><tbody>'+
    l.map(function(p){var i=inv.find(function(x){return x.id===p.invoiceId;});var s=PS[p.status]||["",p.status||"—"];return "<tr><td>"+(p.date?esc(A.date(p.date)):"—")+"</td><td>"+esc(i?i.number:"—")+"</td><td>"+esc(p.method||"—")+'</td><td class="num">'+money(p.amount,i&&i.currency)+"</td><td>"+pill(s[0],s[1])+"</td></tr>";}).join("")+"</tbody></table></div>":
    empty("card","Aucun paiement","Vos règlements apparaîtront ici."))+"</div>";};

/* Projets */
V.projets=function(){var l=mine("projects");
  view.innerHTML=head("Projets","Les projets décrits lors de vos demandes de simulation.",'<a class="btn btn-line btn-sm" href="demo.html">Nouveau projet</a>')+'<div class="sec">'+(l.length?'<ul class="rows">'+
    l.map(function(p){return '<li><button type="button" class="row" data-p="'+esc(p.id)+'"><span class="row-main"><span class="row-t">'+esc(p.name||"Projet sans nom")+'</span><span class="row-s">'+esc([p.type,p.sector].filter(Boolean).join(" · "))+'</span></span><span class="row-side"><span class="row-s">'+esc(A.date(p.createdAt))+"</span>"+ic("chev","chev")+"</span></button></li>";}).join("")+"</ul>":
    empty("folder","Aucun projet","Décrivez votre projet lors de votre demande de simulation : il sera enregistré ici.",'<a class="btn btn-cyan" href="demo.html">Demander ma simulation</a>'))+"</div>";
  view.querySelectorAll("[data-p]").forEach(function(b){b.onclick=function(){projectModal(b.dataset.p);};});};
function projectModal(id){var p=A.records.get("projects",id);if(!p)return;var demos=mineOrEmail("demos").filter(function(d){return d.projectId===p.id;});
  function row(k,v){return v?"<dt>"+esc(k)+"</dt><dd>"+v+"</dd>":"";}
  modal(esc(p.name||"Projet"),'<dl class="kv">'+row("Type",esc(p.type||""))+row("Secteur",esc(p.sector||""))+row("Créé le",esc(A.date(p.createdAt)))+
    row("Description",esc(p.description||""))+row("Objectifs",esc(p.goals||""))+
    row("Fonctionnalités",(p.features||[]).length?'<div class="chips">'+p.features.map(function(f){return '<span class="chip" style="cursor:default">'+esc(f)+"</span>";}).join("")+"</div>":"")+
    row("Besoins",esc(p.needs||""))+row("Rappel par un conseiller",p.callback?"Demandé":"—")+
    row("Fichiers",(p.files||[]).length?'<ul class="files">'+p.files.map(function(f){return "<li><span>"+esc(f.name)+'</span><span class="mut">'+(f.size?Math.max(1,Math.round(f.size/1024))+" Ko":"")+"</span></li>";}).join("")+"</ul>":"")+
    row("Simulation",demos.length?demos.map(function(d){return esc(d.ref||"")+" · "+esc((D.demoStatuses||[])[d.status]||"");}).join("<br>"):"")+"</dl>"+
    '<div class="actions">'+(demos.length?'<a class="btn btn-line btn-sm" href="#demos" data-close>Voir la simulation</a>':'<a class="btn btn-line btn-sm" href="demo.html">Demander une simulation</a>')+"</div>",true);}

/* Simulations */
V.demos=function(){var l=mineOrEmail("demos"),st=D.demoStatuses||[];
  view.innerHTML=head("Simulations","Suivez la préparation de votre simulation personnalisée.",'<a class="btn btn-line btn-sm" href="demo.html">Nouvelle demande</a>')+'<div class="sec">'+(l.length?"<div>"+
    l.map(function(d){var p=d.projectId?A.records.get("projects",d.projectId):null,s=Math.max(0,Math.min(3,d.status|0)),hist=d.history||[];
      return '<article class="demo" aria-labelledby="dm-'+esc(d.id)+'"><div class="demo-h"><div><span class="ref">'+esc(d.ref||"")+'</span><h2 id="dm-'+esc(d.id)+'">'+esc((p&&p.name)||d.company||"Ma simulation")+'</h2><span class="row-s">Demandée le '+esc(A.date(d.createdAt))+"</span></div>"+pill(s===3?"ok":"info",st[s]||"")+"</div>"+
        '<ol class="steps" aria-label="Avancement">'+st.map(function(label,i){var h=hist.filter(function(x){return x.status===i;}).pop();return '<li class="'+(i<s?"done":i===s?"cur":"")+'"'+(i===s?' aria-current="step"':"")+"><span>"+esc(label)+(h&&h.at?"<small>"+esc(A.date(h.at))+"</small>":"")+"</span></li>";}).join("")+"</ol>"+
        (s===3&&d.video?'<div class="actions"><button type="button" class="btn btn-cyan" data-play="'+esc(d.id)+'">'+ic("play")+" Voir ma simulation</button>"+'<a class="btn btn-line" href="offre-sur-mesure.html'+(d.projectId?"?project="+encodeURIComponent(d.projectId):"")+'#rappel">Demander un devis</a></div>':
          s<3?'<p class="sec-p">Vous serez notifié dès que votre simulation sera disponible.</p>':"")+"</article>";}).join("")+"</div>":
    empty("play","Aucune simulation","Présentez votre projet et recevez une vidéo qui montre ce que Vision Plus fera pour vous.",'<a class="btn btn-cyan" href="demo.html">Demander ma simulation</a>'))+"</div>";
  view.querySelectorAll("[data-play]").forEach(function(b){b.onclick=function(){player(b.dataset.play);};});};
function player(id){var d=A.records.get("demos",id);if(!d||!d.video)return;var v=d.video,url=safeUrl(v.url),ch=v.chapters||[];
  var body=url?'<video class="player-v" controls playsinline preload="metadata" src="'+esc(url)+'" aria-label="'+esc(v.title||"Simulation")+'"></video>'+(ch.length?'<ol class="rows" aria-label="Chapitres">'+ch.map(function(c){return '<li style="padding:14px 4px"><b>'+esc(c.title)+'</b><p class="row-s">'+esc(c.text||"")+"</p></li>";}).join("")+"</ol>":""):
    (ch.length?'<div class="reader"><p class="mut small">'+(A.proto?"Mode présentation : la vidéo n'est pas encore en ligne. Voici le déroulé de votre simulation.":"La vidéo sera bientôt en ligne. Voici le déroulé de votre simulation.")+'</p><div class="reader-bar" aria-hidden="true"><i id="rd-bar"></i></div><div class="reader-c" id="rd-c" aria-live="polite"></div><ul class="chap-list" id="rd-list" aria-label="Chapitres"></ul><div class="actions"><button type="button" class="btn btn-line btn-sm" id="rd-prev">Précédent</button><button type="button" class="btn btn-cyan btn-sm" id="rd-next">Suivant</button></div></div>':
      empty("play","Vidéo bientôt disponible","Votre simulation sera visible ici dès sa mise en ligne."));
  var m=modal(esc(v.title||"Ma simulation"),body+'<div class="actions"><a class="btn btn-ghost" href="offre-sur-mesure.html'+(d.projectId?"?project="+encodeURIComponent(d.projectId):"")+'#rappel">Demander un devis '+ic("arrow","arrow")+"</a></div>",true);
  if(!url&&ch.length){var i=0,c=m.querySelector("#rd-c"),list=m.querySelector("#rd-list"),pv=m.querySelector("#rd-prev"),nx=m.querySelector("#rd-next");
    list.innerHTML=ch.map(function(x,k){return '<li><button type="button" data-k="'+k+'">'+(k+1)+". "+esc(x.title)+"</button></li>";}).join("");
    function show(k){i=k;c.innerHTML='<span class="ref">Chapitre '+(k+1)+" sur "+ch.length+"</span><h3>"+esc(ch[k].title)+"</h3><p>"+esc(ch[k].text||"")+"</p>";m.querySelector("#rd-bar").style.width=((k+1)/ch.length*100)+"%";
      list.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-current",+b.dataset.k===k?"true":"false");});pv.disabled=k===0;nx.disabled=k===ch.length-1;}
    list.addEventListener("click",function(e){var b=e.target.closest("[data-k]");if(b)show(+b.dataset.k);});pv.onclick=function(){if(i>0)show(i-1);};nx.onclick=function(){if(i<ch.length-1)show(i+1);};show(0);}}

/* Assistance */
function savContact(){var s=(A.config&&A.config.sav)||{},p=[];
  if(s.email)p.push('<a class="link" href="mailto:'+esc(s.email)+'">'+esc(s.email)+"</a>");
  if(s.phone)p.push('<a class="link" href="tel:'+esc(String(s.phone).replace(/[^\d+]/g,"").replace(/^0/,"+33"))+'">'+esc(s.phone)+"</a>");
  return p.length?'<div class="notice info">'+ic("phone")+"<span>Joindre le SAV : "+p.join(" · ")+"</span></div>":"";}
V.assistance=function(){var l=mineOrEmail("tickets");
  view.innerHTML=head("Assistance","Vos demandes auprès du SAV Vision Plus.",'<a class="btn btn-line btn-sm" href="sav.html">Nouvelle demande</a>')+savContact()+'<div class="sec">'+(l.length?'<ul class="rows">'+
    l.map(function(t){return '<li><button type="button" class="row" data-t="'+esc(t.id)+'"><span class="row-main"><span class="ref">'+esc(t.ref||"")+'</span><span class="row-t">'+esc(t.subject||t.type||"Demande")+'</span><span class="row-s">'+esc([t.type,A.date(t.updatedAt||t.createdAt)].filter(Boolean).join(" · "))+'</span></span><span class="row-side">'+pill(TICKET_CLS[t.status]||"",t.status||"")+ic("chev","chev")+"</span></button></li>";}).join("")+"</ul>":
    empty("life","Aucune demande","Une question ou un problème ? Notre équipe vous répond.",'<a class="btn btn-cyan" href="sav.html">Ouvrir une demande</a><a class="btn btn-ghost" href="faq.html#question">Poser une question</a>'))+"</div>";
  view.querySelectorAll("[data-t]").forEach(function(b){b.onclick=function(){ticketModal(b.dataset.t);};});};
function ticketModal(id){var t=A.records.get("tickets",id);if(!t)return;
  var WHO={client:"Vous",agent:"Équipe Vision Plus",ia:"Assistant IA"};
  function thread(t){var msgs=(t.messages||[]).slice();if(t.description&&!(msgs[0]&&msgs[0].from==="client"&&msgs[0].body===t.description))msgs.unshift({from:"client",body:t.description,at:t.createdAt});
    return msgs.map(function(x){var f=WHO[x.from]?x.from:"agent";return '<div class="msg '+f+'"><p>'+esc(x.body)+"</p><small>"+esc(WHO[f])+(x.at?" · "+esc(A.date(x.at,true)):"")+"</small></div>";}).join("")||'<p class="mut">Aucun message.</p>';}
  var closed=t.status==="Fermée";
  var m=modal(esc(t.subject||"Demande"),'<div class="row-between" style="display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center"><span class="ref">'+esc(t.ref||"")+(t.type?" · "+esc(t.type):"")+"</span>"+'<span id="tk-st">'+pill(TICKET_CLS[t.status]||"",t.status||"")+"</span></div>"+
    '<div class="thread" id="tk-thread" aria-live="polite">'+thread(t)+"</div>"+
    (closed?'<p class="mut small">Cette demande est fermée. Pour un nouveau sujet, <a class="link" href="sav.html">ouvrez une demande</a>.</p>':
    '<form class="form" id="tk-f" novalidate><div class="field"><label for="tk-reply">Votre réponse</label><textarea class="input" id="tk-reply" rows="3" style="min-height:96px" required></textarea></div><p class="small" id="tk-msg" aria-live="polite"></p><div class="actions"><button class="btn btn-cyan" type="submit">'+ic("send")+" Envoyer</button></div></form>"),true);
  var th=m.querySelector("#tk-thread");th.scrollTop=th.scrollHeight;
  var f=m.querySelector("#tk-f");if(f)f.addEventListener("submit",function(e){e.preventDefault();var ta=m.querySelector("#tk-reply"),body=ta.value.trim();
    if(!body){setMsg(m.querySelector("#tk-msg"),"Écrivez votre message avant d'envoyer.");ta.focus();return;}
    var cur=A.records.get("tickets",id);var msgs=(cur.messages||[]).concat({from:"client",body:body,at:A.now()});
    var up=A.records.update("tickets",id,{messages:msgs,status:"En cours"});A.audit("Réponse client SAV",cur.ref||id);
    ta.value="";th.innerHTML=thread(up);th.scrollTop=th.scrollHeight;m.querySelector("#tk-st").innerHTML=pill("info","En cours");
    setMsg(m.querySelector("#tk-msg"),"Message envoyé à l'équipe Vision Plus.",true);V.assistance();renderNav("assistance");});}

/* Conversations IA */
V.conversations=function(){var l=mine("conversations").slice(0,60);
  view.innerHTML=head("Conversations IA","Vos échanges avec l'assistant Vision Plus.",'<a class="btn btn-line btn-sm" href="faq.html#question">Poser une question</a>')+'<div class="sec">'+(l.length?'<ul class="rows">'+
    l.map(function(c){return '<li class="notif" style="display:block"><div class="row-main"><span class="row-s">'+esc(A.date(c.createdAt,true))+'</span><span class="row-t">'+esc(c.q)+'</span><p class="row-s clip3">'+esc(c.a)+'</p><div class="notif-act">'+(c.found?pill("ok","Réponse trouvée"):pill("warn","Orienté vers le SAV"))+"</div></div></li>";}).join("")+"</ul>":
    empty("chat","Aucune conversation","Posez vos questions à l'assistant : vos échanges seront conservés ici.",'<a class="btn btn-cyan" href="faq.html#question">Poser une question</a>'))+"</div>";};

/* Notifications */
V.notifications=function(){var u=me,l=A.records.list("notifications",function(n){return n.userId===u.id;}).sort(byDate),unread=l.filter(function(n){return !n.read;}).length;
  view.innerHTML=head("Notifications",unread?unread+" non lue"+(unread>1?"s":""):"Vous êtes à jour.",l.length?'<button type="button" class="btn btn-line btn-sm" id="all-read"'+(unread?"":" disabled")+">"+ic("check")+" Tout marquer comme lu</button>":"")+
    '<div class="sec">'+(l.length?'<ul class="rows">'+l.map(function(n){var link=safeLink(n.link);
      return '<li class="notif'+(n.read?"":" unread")+'"><span class="dot" aria-hidden="true"></span><div class="row-main"><b>'+(n.read?"":'<span class="sr">Non lue : </span>')+esc(n.title)+"</b>"+(n.body?'<span class="row-s">'+esc(n.body)+"</span>":"")+
        '<div class="notif-act"><span class="row-s">'+esc(A.date(n.createdAt,true))+"</span>"+(link?'<a class="link small" href="'+esc(link)+'" data-open="'+esc(n.id)+'">Ouvrir</a>':"")+(n.read?"":'<button type="button" class="btn-txt" data-read="'+esc(n.id)+'">Marquer comme lu</button>')+"</div></div></li>";}).join("")+"</ul>":
    empty("bell","Aucune notification","Vous serez prévenu ici de l'avancement de vos demandes."))+"</div>";
  view.querySelectorAll("[data-read]").forEach(function(b){b.onclick=function(){A.records.update("notifications",b.dataset.read,{read:true});render("notifications",true);};});
  view.querySelectorAll("[data-open]").forEach(function(a){a.addEventListener("click",function(){A.records.update("notifications",a.dataset.open,{read:true});renderNav(current());});});
  var all=document.getElementById("all-read");if(all)all.onclick=function(){l.forEach(function(n){if(!n.read)A.records.update("notifications",n.id,{read:true});});A.toast("Toutes les notifications sont lues.");render("notifications",true);};};

/* Paramètres */
V.parametres=function(){var u=me,p=Object.assign({news:false,notifEmail:true,notifSms:false},u.prefs||{}),c=A.consent.get();
  function sw(id,key,title,text,disabled){return '<div class="pref"><div><b id="'+id+'-l">'+esc(title)+"</b><p>"+text+'</p></div><label class="switch"><input type="checkbox" id="'+id+'" data-k="'+key+'" aria-labelledby="'+id+'-l"'+(p[key]?" checked":"")+(disabled?" disabled":"")+"><span></span></label></div>";}
  view.innerHTML=head("Paramètres","Notifications et cookies.")+
    '<div class="sec"><div class="sec-h"><h2>Notifications</h2><p>Enregistrement automatique.</p></div><div>'+
      sw("pr-email","notifEmail","Par e-mail","Avancement de vos simulations et réponses du SAV."+(u.email?"":" Ajoutez une adresse e-mail dans votre profil."),!u.email)+
      sw("pr-sms","notifSms","Par SMS","Alertes importantes uniquement."+(u.phone?"":" Ajoutez un numéro dans votre profil."),!u.phone)+
      sw("pr-news","news","Actualités Vision Plus","Nouveautés de la plateforme, sans excès.",false)+
    '</div><p id="pr-msg" class="small" aria-live="polite"></p></div>'+
    '<div class="sec"><div class="sec-h"><h2>Cookies</h2></div><p class="sec-p">'+(c?"Mesure d'audience : "+(c.analytics?"acceptée":"refusée")+" · Personnalisation : "+(c.marketing?"acceptée":"refusée")+" · Choix du "+esc(A.date(c.date))+".":"Vous n'avez pas encore enregistré vos préférences.")+
    '</p><div class="actions"><button type="button" class="btn btn-line" id="cookies">Gérer mes cookies</button><a class="link small" href="cookies.html">Politique cookies</a></div></div>';
  view.querySelectorAll("[data-k]").forEach(function(i){i.addEventListener("change",function(){var np=Object.assign({},p);view.querySelectorAll("[data-k]").forEach(function(x){np[x.dataset.k]=x.checked;});p=np;A.auth.update({prefs:np});me=A.auth.current();setMsg(document.getElementById("pr-msg"),"Préférences enregistrées.",true);});});
  document.getElementById("cookies").onclick=function(){A.consent.open();};};
document.addEventListener("vp:consent",function(){if(current()==="parametres")render("parametres",true);});

/* Mes données */
V.donnees=function(){var u=me,reqs=mine("dataRequests"),pendingDel=reqs.some(function(r){return r.kind==="delete"&&r.status!=="Traitée";});
  view.innerHTML=head("Mes données","Exercez vos droits sur vos données personnelles.",'<a class="link small" href="confidentialite.html">Politique de confidentialité</a>')+
    '<div class="sec"><div class="sec-h"><h2>Exporter mes données</h2></div><p class="sec-p">Obtenez une copie de vos informations : profil, projets, simulations, demandes (dont les demandes de rappel), offre et notifications.</p>'+
      '<div class="actions"><button type="button" class="btn btn-cyan" id="export">'+ic("db")+" Générer l'export</button></div><div id=\"export-out\"></div></div>"+
    '<div class="sec"><div class="sec-h"><h2>Supprimer mon compte</h2></div><p class="sec-p">La suppression de votre compte et de vos données est traitée par l\'équipe Vision Plus. Certaines informations peuvent devoir être conservées pour des obligations légales.</p>'+
      (pendingDel?'<div class="notice info">'+ic("info")+"<span>Votre demande de suppression a bien été reçue. Elle sera traitée par l'équipe Vision Plus, qui vous tiendra informé.</span></div>":
      '<div class="actions"><button type="button" class="btn btn-danger" id="del">Demander la suppression</button></div>')+"</div>"+
    (reqs.length?'<div class="sec"><div class="sec-h"><h2>Mes demandes</h2></div><div class="tbl-wrap"><table class="tbl"><caption class="sr">Demandes relatives à mes données</caption><thead><tr><th scope="col">Date</th><th scope="col">Demande</th><th scope="col">Statut</th></tr></thead><tbody>'+
      reqs.map(function(r){return "<tr><td>"+esc(A.date(r.createdAt,true))+"</td><td>"+(r.kind==="delete"?"Suppression du compte":"Export des données")+"</td><td>"+pill(r.status==="Traitée"?"ok":"info",r.status)+"</td></tr>";}).join("")+"</tbody></table></div></div>":"");
  document.getElementById("export").onclick=function(){
    var safe={};Object.keys(u).forEach(function(k){if(k!=="pw"&&k!=="salt")safe[k]=u[k];});
    var data={exportéLe:new Date().toISOString(),compte:safe,projets:mine("projects"),demonstrations:mineOrEmail("demos"),demandesSav:mineOrEmail("tickets"),
      offres:mine("subscriptions"),demandesDeRappel:mineOrEmail("rappels"),factures:mine("invoices"),paiements:mine("payments"),notifications:mine("notifications"),conversationsIa:mine("conversations"),sessions:mine("sessions"),demandesDonnees:mine("dataRequests")};
    A.records.add("dataRequests",{userId:u.id,kind:"export",status:"Reçue"});A.audit("Export de données demandé",u.email||u.phone);
    V.donnees();var out=document.getElementById("export-out");
    out.innerHTML='<div class="field" style="margin-top:6px"><label for="export-json">Vos données (JSON)</label><textarea class="input codebox" id="export-json" readonly spellcheck="false"></textarea></div><div class="actions" style="margin-top:12px"><button type="button" class="btn btn-line btn-sm" id="copy">Copier</button><span id="copy-msg" class="small" aria-live="polite"></span></div>';
    var ta=document.getElementById("export-json");ta.value=JSON.stringify(data,null,2);ta.focus();ta.select();
    document.getElementById("copy").onclick=function(){var cm=document.getElementById("copy-msg");ta.select();
      function ok(){setMsg(cm,"Copié dans le presse-papiers.",true);}
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(ok,function(){try{document.execCommand("copy");ok();}catch(e){setMsg(cm,"Sélectionnez le texte puis copiez-le (Ctrl+C).");}});
      else{try{document.execCommand("copy");ok();}catch(e){setMsg(cm,"Sélectionnez le texte puis copiez-le (Ctrl+C).");}}};};
  var del=document.getElementById("del");if(del)del.onclick=function(){
    var m=modal("Supprimer mon compte ?",'<p class="mut">Votre demande sera transmise à l\'équipe Vision Plus, qui supprimera votre compte et vos données personnelles, sous réserve des informations à conserver pour des obligations légales. Cette action est définitive une fois traitée.</p>'+
      '<label class="check" for="del-ok"><input type="checkbox" id="del-ok"><span>Je confirme vouloir supprimer mon compte Vision Plus.</span></label><div class="actions"><button type="button" class="btn btn-danger" id="del-go" disabled>Confirmer la demande</button><button type="button" class="btn btn-ghost" data-close>Annuler</button></div>');
    var ok=m.querySelector("#del-ok"),go=m.querySelector("#del-go");ok.onchange=function(){go.disabled=!ok.checked;};
    go.onclick=function(){A.records.add("dataRequests",{userId:u.id,kind:"delete",status:"Reçue"});A.audit("Suppression de compte demandée",u.email||u.phone);
      A.closeModal(m);A.toast("Votre demande de suppression a été transmise à l'équipe Vision Plus.");render("donnees",true);};};};

/* ---------- données d'exemple (prototype uniquement) ---------- */
function sampleData(){var u=me,now=A.now(),day=864e5;
  if(mine("projects").some(function(p){return /^Exemple · /.test(p.name||"");})){A.toast("Les données d'exemple sont déjà présentes.");return;}
  var p=A.records.add("projects",{userId:u.id,name:"Exemple · Restaurant Le Quai",type:(D.projectTypes||[])[5]||"Projet combiné",sector:(D.sectors||[])[0]||"",description:"Projet d'exemple créé pour découvrir l'espace client. Aucune donnée réelle.",goals:"Exemple : être plus visible en ligne et ne plus manquer d'appels.",features:(D.features||[]).slice(0,4),needs:"Exemple : prise de réservation par téléphone.",plan:"",files:[]});
  A.records.add("demos",{ref:"DEMO-"+six(),userId:u.id,name:u.name,email:u.email||"",phone:u.phone||"",company:"Exemple",projectId:p.id,status:3,
    history:[{status:0,at:now-6*day,note:"Exemple"},{status:1,at:now-5*day,note:"Exemple"},{status:2,at:now-3*day,note:"Exemple"},{status:3,at:now-day,note:"Exemple"}],
    analysis:{features:(D.features||[]).slice(0,4),notes:"Analyse d'exemple."},
    video:{url:"",title:"Exemple · Votre simulation Vision Plus",publishedAt:now-day,chapters:[
      {title:"Votre web app",text:"Exemple : la page d'accueil de votre établissement, ses horaires et son menu, modifiables à tout moment."},
      {title:"Votre secrétaire IA",text:"Exemple : votre secrétaire IA répond aux appels, propose un créneau et confirme la réservation."},
      {title:"L'agent marketing",text:"Exemple : des publications préparées pour vos réseaux, que vous validez avant diffusion."},
      {title:"La gestion par IA",text:"Exemple : « Ajoute la soirée jazz de vendredi » — la modification est préparée, vous la validez."}]},createdAt:now-6*day});
  A.records.add("tickets",{ref:"SAV-"+six(),userId:u.id,name:u.name,email:u.email||"",type:(D.savTypes||[])[1]||"Mon compte",subject:"Exemple · Question sur mon compte",description:"Ceci est une demande d'exemple.",files:[],status:"En attente de votre réponse",
    messages:[{from:"client",body:"Ceci est une demande d'exemple.",at:now-2*day},{from:"agent",body:"Exemple de réponse de l'équipe Vision Plus. Pouvez-vous nous en dire plus ?",at:now-day}],aiTried:false,createdAt:now-2*day});
  A.notify(u.id,"Exemple · Votre simulation est disponible","Notification d'exemple.","espace-client.html#demos");
  A.notify(u.id,"Exemple · Réponse à votre demande SAV","Notification d'exemple.","espace-client.html#assistance");
  A.toast("Données d'exemple ajoutées.");render("tableau",true);}

/* ---------- routage ---------- */
var TITLES={};NAV.forEach(function(n){if(n.id)TITLES[n.id]=n.l;});
function current(){var h=location.hash.replace(/^#/,"");return V[h]?h:"tableau";}
function render(id,keepFocus){try{user();}catch(e){return;}
  renderNav(id);V[id]();document.title=TITLES[id]+" · Espace client · Vision Plus";
  view.classList.remove("view");void view.offsetWidth;view.classList.add("view");}
function go(focus){var id=current();render(id);if(focus){window.scrollTo(0,0);var h=document.getElementById("view-title");if(h)h.focus({preventScroll:true});}}
/* changement de langue : la vue est redessinée (dates au format de la langue choisie) */
document.addEventListener("vp:lang",function(){try{go(false);}catch(e){}});
window.addEventListener("hashchange",function(){go(true);});
/* Lien interne vers la même rubrique : re-rendu sans changement d'ancre */
nav.addEventListener("click",function(e){var a=e.target.closest('a[href^="#"]');if(a&&a.getAttribute("href")==="#"+current()){e.preventDefault();go(true);}});
document.addEventListener("input",function(e){if(e.target.getAttribute&&e.target.getAttribute("aria-invalid"))e.target.removeAttribute("aria-invalid");});
go(false);
})();
