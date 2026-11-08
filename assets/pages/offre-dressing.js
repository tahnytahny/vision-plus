/* Vision Plus — page « Offre sur mesure » : le dressing des métiers.
   Données : assets/metiers/metiers.json (archive AxIa-Vitrine-Metiers : 139 métiers, 9 familles, 18 modèles,
   politiques de paiement). La liste est déjà écrite dans la page (outils/dressing/generer_liste.py) ; ce script ajoute :
   recherche sans accents (nom, mots-clés de référencement, nom traduit), filtres par famille, niches du mur,
   tenue du robot (la tenue quitte sa niche, s’avance et le robot l’enfile), présentation du métier choisi,
   aperçus des modèles (maquettes de démonstration, commerces fictifs) et lien avec le formulaire de rappel. */
(function(){
"use strict";
var A=window.VISIONPLUS||{},D=document;
var $=function(id){return D.getElementById(id);};
var esc=A.esc||function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});};
var RM=window.matchMedia("(prefers-reduced-motion: reduce)");
var WIDE=window.matchMedia("(min-width: 1100px)");
var FINE=window.matchMedia("(hover: hover) and (pointer: fine)");
var set=$("dr-set");if(!set)return;
var bg=$("dr-bg"),robot=$("dr-robot"),fly=$("dr-fly"),list=$("dr-list"),q=$("dr-q"),live=$("dr-live");
var items=[].slice.call(list.querySelectorAll(".dr-item"));
var chips=[].slice.call(D.querySelectorAll(".dr-chip"));
var niches=[].slice.call(D.querySelectorAll(".dr-niche"));
var layers=[].slice.call(robot.querySelectorAll(".dr-r")),front=0,wearing="neutre";
var DATA=null,BY={},ORDER=items.map(function(b){return b.parentNode;});
var state={fam:"",id:null,autre:false};

D.querySelectorAll("main [data-ico]").forEach(function(el){if(A.icon)el.outerHTML=A.icon(el.dataset.ico,el.dataset.cls||"");});

/* ---------- chargement de la scène ---------- */
function sceneReady(){set.classList.remove("is-loading");}
if(bg.complete&&bg.naturalWidth)sceneReady();
else{bg.addEventListener("load",sceneReady);
  bg.addEventListener("error",function(){set.classList.add("is-broken");$("dr-broken").hidden=false;sceneReady();});}

/* ---------- tenues du mur (repère du visuel 1672 x 941 : outils/dressing/niches.json) ---------- */
var NICHE={
  pro:{x:40.5,y:122.5,w:199.5,h:284.5},bouche:{x:263,y:132,w:189.5,h:283},beaute:{x:482.5,y:159.5,w:178,h:257.5},
  sante:{x:674.5,y:171,w:200.5,h:254.5},auto:{x:1087,y:152,w:187,h:267},artisan:{x:25,y:454.5,w:221,h:275.5},
  boutique:{x:468,y:457.5,w:169,h:279},loisirs:{x:649,y:455,w:186,h:275.5},resto:{x:1240.5,y:196,w:354,h:675.5}};
var TORSE={x:1000,y:650,h:330};   /* poitrine du robot dans le visuel */
function rsrc(f,w){return "assets/dressing/robots/robot-"+f+"-"+w+".webp";}
function rset(f){return rsrc(f,528)+" 528w, "+rsrc(f,1056)+" 1056w";}
function tsrc(f){return "assets/dressing/tenues/tenue-"+f+".webp";}
var cache={};
function preload(f){
  if(!f||cache[f])return cache[f];
  var im=new Image();im.decoding="async";im.sizes=layers[0].getAttribute("sizes")||"";im.srcset=rset(f);im.src=rsrc(f,528);
  if(NICHE[f]){var t=new Image();t.src=tsrc(f);}
  cache[f]=(im.decode?im.decode():new Promise(function(ok,ko){im.onload=ok;im.onerror=ko;})).then(function(){return im;},function(e){delete cache[f];throw e;});
  return cache[f];}

var seq=0;
function wear(f){
  f=f||"neutre";
  if(f===wearing){if(!RM.matches){robot.classList.remove("is-dressing");void robot.offsetWidth;robot.classList.add("is-dressing");}return;}
  var my=++seq,slow=setTimeout(function(){set.classList.add("is-waiting");},180);
  preload(f).then(function(){
    clearTimeout(slow);set.classList.remove("is-waiting");
    if(my!==seq)return;
    var back=layers[1-front];
    back.setAttribute("sizes",layers[front].getAttribute("sizes")||"");back.srcset=rset(f);back.src=rsrc(f,528);
    var swap=function(){if(my!==seq)return;
      /* la nouvelle tenue apparaît par-dessus l’ancienne, qui reste opaque dessous puis s’efface sans transition */
      var old=layers[front];front=1-front;wearing=f;back.style.zIndex=2;old.style.zIndex=1;back.classList.add("is-on");
      clearTimeout(old.__t);old.__t=setTimeout(function(){if(layers[front]===old)return;old.style.transition="none";old.classList.remove("is-on");void old.offsetWidth;old.style.transition="";},RM.matches?0:620);
      if(!RM.matches){robot.classList.remove("is-dressing");void robot.offsetWidth;robot.classList.add("is-dressing");}};
    var ready=back.decode?back.decode().catch(function(){}):Promise.resolve();
    ready.then(function(){if(RM.matches||!NICHE[f])swap();else flight(f,swap);});
  },function(){clearTimeout(slow);set.classList.remove("is-waiting");/* tenue indisponible : le robot garde la précédente */});
}
function flight(f,done){
  var n=NICHE[f],k=set.clientWidth/1672;
  if(!k||!fly.animate){done();return;}
  var go=function(){
    fly.onload=fly.onerror=null;
    fly.style.left=(n.x/16.72)+"%";fly.style.top=(n.y/9.41)+"%";fly.style.width=(n.w/16.72)+"%";fly.style.height=(n.h/9.41)+"%";
    var tx=(TORSE.x-(n.x+n.w/2))*k,ty=(TORSE.y-(n.y+n.h/2))*k,s=Math.max(.9,Math.min(1.45,TORSE.h/n.h)),m=1.08+(s-1.08)*.55;
    if(fly.__an)fly.__an.cancel();
    fly.__an=fly.animate([
      {transform:"translate(0,0) scale(1)",opacity:0,filter:"drop-shadow(0 0 0 rgba(90,170,255,0))"},
      {transform:"translate(0,0) scale(1.08)",opacity:1,filter:"drop-shadow(0 0 1.4cqw rgba(90,170,255,.85))",offset:.24},
      {transform:"translate("+(tx*.55)+"px,"+(ty*.55)+"px) scale("+m+")",opacity:1,filter:"drop-shadow(0 0 1.8cqw rgba(120,195,255,.9))",offset:.62},
      {transform:"translate("+tx+"px,"+ty+"px) scale("+s+")",opacity:0,filter:"drop-shadow(0 0 2.2cqw rgba(160,215,255,.9))"}
    ],{duration:920,easing:"cubic-bezier(.45,.05,.25,1)",fill:"both"});
    setTimeout(done,560);};
  if(fly.getAttribute("src")===tsrc(f)&&fly.complete&&fly.naturalWidth)go();
  else{fly.onload=go;fly.onerror=function(){fly.onload=fly.onerror=null;done();};fly.src=tsrc(f);}
}
function intent(f){if(f)preload(f).catch(function(){});}

/* ---------- recherche ---------- */
function fold(s){s=String(s||"").toLowerCase();if(s.normalize)s=s.normalize("NFD").replace(/[̀-ͯ]/g,"");
  return s.replace(/œ/g,"oe").replace(/æ/g,"ae").replace(/ß/g,"ss").replace(/[’'`´\-_/.,;:!?()«»"&+]/g," ").replace(/\s+/g," ").trim();}
function stem(t){return t.length>3?t.replace(/(aux|eaux|s|x)$/,function(x){return x==="aux"?"al":"";}):t;}
var HAY={};
function hay(b){var id=b.dataset.id,m=BY[id];
  var base=HAY[id]||(HAY[id]=fold((m?m.nom+" "+m.seo.join(" ")+" "+(DATA.familles[m.fam]||{}).nom:"")));
  var shown=fold(b.textContent);   /* nom affiché, éventuellement traduit */
  return {nom:fold(b.querySelector(".dr-n").textContent)+" "+fold(m?m.nom:""),all:base+" "+shown};}
function score(b,toks,raw){
  if(!toks.length)return 0;var h=hay(b);
  for(var i=0;i<toks.length;i++){var t=toks[i],u=stem(t);if(h.all.indexOf(t)<0&&h.all.indexOf(u)<0)return -1;}
  if(h.nom.indexOf(raw)===0)return 3;
  if((" "+h.nom).indexOf(" "+toks[0])>-1)return 2;
  return h.nom.indexOf(toks[0])>-1?1:0;}
function count(n){var c=$("dr-count");c.querySelector(".dr-num").textContent=n;c.lastElementChild.textContent=n===1?"métier":"métiers";}
function pass(toks,raw){var res=[];
  ORDER.forEach(function(li,i){var b=li.firstElementChild,ok=!state.fam||b.dataset.fam===state.fam,s=ok?(DATA?score(b,toks,raw):(toks.length?(fold(b.textContent).indexOf(raw)>-1?1:-1):0)):-1;
    if(s>=0)res.push([s,i,li]);});return res;}
function filter(){
  var raw=fold(q.value),toks=raw?raw.split(" "):[],res=pass(toks,raw);
  /* aucun résultat : recherche approchée sur le début des mots (pâtissier → pâtisserie, menuisiers → menuiserie) */
  if(!res.length&&toks.length){var loose=toks.map(function(t){return t.length>5?t.slice(0,Math.max(5,t.length-3)):t;});
    if(loose.join(" ")!==raw)res=pass(loose,loose.join(" "));}
  var keep=new Set(res.map(function(r){return r[2];})),n=res.length;
  $("dr-clear").hidden=!q.value;
  ORDER.forEach(function(li){li.hidden=!keep.has(li);});
  if(toks.length){res.sort(function(a,b){return b[0]-a[0]||a[1]-b[1];});res.forEach(function(r){list.appendChild(r[2]);});}
  else ORDER.forEach(function(li){list.appendChild(li);});
  count(n);$("dr-none").hidden=n>0;}
var qt;q.addEventListener("input",function(){clearTimeout(qt);qt=setTimeout(filter,60);});
q.addEventListener("keydown",function(e){
  if(e.key==="ArrowDown"){var v=visible();if(v[0]){e.preventDefault();v[0].focus();}}
  else if(e.key==="Enter"){var w=visible();if(w[0]){e.preventDefault();select(w[0].dataset.id,{from:"search"});}}
  else if(e.key==="Escape"&&q.value){e.preventDefault();q.value="";filter();}});
$("dr-clear").addEventListener("click",function(){q.value="";filter();q.focus();});
function visible(){return [].slice.call(list.querySelectorAll("li:not([hidden]) .dr-item"));}
list.addEventListener("keydown",function(e){
  var v=visible(),i=v.indexOf(D.activeElement);if(i<0)return;
  var cols=Math.max(1,Math.round(list.clientWidth/(v[0].offsetWidth||list.clientWidth))),j=null;
  if(e.key==="ArrowDown")j=Math.min(v.length-1,i+cols);else if(e.key==="ArrowUp")j=i-cols<0?-1:i-cols;
  else if(e.key==="ArrowRight")j=Math.min(v.length-1,i+1);else if(e.key==="ArrowLeft")j=Math.max(0,i-1);
  else if(e.key==="Home")j=0;else if(e.key==="End")j=v.length-1;
  if(j===null)return;e.preventDefault();if(j<0)q.focus();else v[j].focus();});

/* ---------- familles : boutons et niches du mur ---------- */
function famName(f){return f&&DATA&&DATA.familles[f]?DATA.familles[f].nom:"";}
function setFam(f,opts){
  state.fam=f||"";
  chips.forEach(function(c){c.setAttribute("aria-pressed",c.dataset.fam===state.fam?"true":"false");});
  filter();
  if(state.fam){niches.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.fam===state.fam?"true":"false");});wear(state.fam);
    if(!state.id||BY[state.id].fam!==state.fam){caption(famName(state.fam),"");announce(famName(state.fam),"");}}
  else{var m=state.id&&BY[state.id];niches.forEach(function(b){b.setAttribute("aria-pressed",m&&b.dataset.fam===m.fam?"true":"false");});
    wear(m?m.fam:"neutre");if(!m)caption("","");}
  if(opts&&opts.show)list.scrollTop=0;}
var fams=$("dr-fams");
fams.addEventListener("wheel",function(e){if(Math.abs(e.deltaY)<=Math.abs(e.deltaX)||fams.scrollWidth<=fams.clientWidth)return;
  var max=fams.scrollWidth-fams.clientWidth,x=fams.scrollLeft;if((e.deltaY<0&&x<=0)||(e.deltaY>0&&x>=max-1))return;e.preventDefault();fams.scrollLeft+=e.deltaY;},{passive:false});
function chipInView(f){var p=fams.querySelector('[data-fam="'+(f||"")+'"]');if(p&&p.scrollIntoView&&fams.scrollWidth>fams.clientWidth){var r=p.getBoundingClientRect(),R=fams.getBoundingClientRect();if(r.left<R.left||r.right>R.right)fams.scrollLeft+=r.left-R.left-(R.width-r.width)/2;}}
chips.forEach(function(c){c.addEventListener("click",function(){setFam(c.dataset.fam,{show:true});});
  c.addEventListener("pointerenter",function(){intent(c.dataset.fam);});c.addEventListener("focus",function(){intent(c.dataset.fam);});});
niches.forEach(function(b){b.addEventListener("click",function(){setFam(b.dataset.fam,{show:true});chipInView(b.dataset.fam);});
  b.addEventListener("pointerenter",function(){intent(b.dataset.fam);});b.addEventListener("focus",function(){intent(b.dataset.fam);});});

/* ---------- légende et annonces ---------- */
function caption(t,m){$("dr-cap-t").textContent=t||"Tenue d’accueil Vision Plus";$("dr-cap-m").textContent=m||"";}
function announce(a,b){live.textContent="";setTimeout(function(){live.innerHTML="<span>"+esc(a)+"</span>"+(b?" — <span>"+esc(b)+"</span>":"");},40);}

/* ---------- choix d’un métier ---------- */
items.forEach(function(b){b.addEventListener("click",function(){select(b.dataset.id,{from:"list"});});
  b.addEventListener("pointerenter",function(){intent(b.dataset.fam);});b.addEventListener("focus",function(){intent(b.dataset.fam);});});
function mark(id){items.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.id===id?"true":"false");});
  $("dr-autre").setAttribute("aria-pressed",id==="autre"?"true":"false");}
function url(id){try{var u=new URL(location.href);if(id)u.searchParams.set("metier",id);else u.searchParams.delete("metier");
  history.replaceState(history.state,"",u.pathname+u.search+u.hash);}catch(e){}}
function sceneInView(){var r=set.parentNode.getBoundingClientRect();return r.bottom>110&&r.top<innerHeight-120;}
function select(id,opts){
  var m=BY[id];if(!m)return;
  state.id=id;state.autre=false;mark(id);
  niches.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.fam===m.fam?"true":"false");});
  caption(famName(m.fam),m.nom);wear(m.fam);
  announce(m.nom,famName(m.fam));
  render(m);models(m.fam,m.tpl);url(id);
  $("dr-go").hidden=false;
  if(opts&&opts.from!=="load"&&!WIDE.matches&&!sceneInView())
    $("dressing").scrollIntoView({behavior:RM.matches?"auto":"smooth",block:"start"});}
$("dr-autre").addEventListener("click",function(){
  state.id=null;state.autre=true;mark("autre");
  niches.forEach(function(b){b.setAttribute("aria-pressed","false");});
  caption("","Activité sur mesure");wear("neutre");renderAutre();models("",null);url("autre");
  $("dr-go").hidden=false;go();});
function go(){var p=$("presentation");p.scrollIntoView({behavior:RM.matches?"auto":"smooth",block:"start"});
  setTimeout(function(){var h=$("t-pres");if(h)h.focus({preventScroll:true});},RM.matches?0:450);}
$("dr-go").addEventListener("click",function(e){e.preventDefault();go();});
D.querySelectorAll("[data-choisir]").forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();
  $("dressing").scrollIntoView({behavior:RM.matches?"auto":"smooth",block:"start"});
  setTimeout(function(){if(FINE.matches)q.focus({preventScroll:true});else $("t-choix").setAttribute("tabindex","-1"),$("t-choix").focus({preventScroll:true});},RM.matches?0:420);});});

/* ---------- présentation du métier ---------- */
var I={ok:'<svg class="dr-i" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.8"/></svg>',
  opt:'<svg class="dr-i" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  need:'<svg class="dr-i" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  info:'<svg class="dr-i" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
  arrow:'<svg class="ico arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'};
/* parcours de réservation de l’archive (mode de chaque métier) : nom, besoins, réponse proposée au client */
var MODE={
  rdv:{nom:"Prise de rendez-vous",besoins:["Recevoir des demandes de rendez-vous","Présenter clairement vos prestations","Tenir à jour vos horaires et informations pratiques"],rep:"Créneau proposé"},
  visio:{nom:"Rendez-vous en visio",besoins:["Proposer des rendez-vous à distance","Présenter votre expertise","Tenir à jour vos informations pratiques"],rep:"Rendez-vous proposé"},
  table:{nom:"Réservation de table",besoins:["Recevoir des réservations de table","Présenter votre carte","Indiquer vos horaires et votre accès"],rep:"Table proposée"},
  commande:{nom:"Commande en ligne",besoins:["Recevoir des commandes","Présenter vos produits","Organiser le retrait ou la livraison"],rep:"Commande enregistrée"},
  precommande:{nom:"Précommande",besoins:["Recevoir des précommandes","Présenter vos produits du moment","Fixer les dates de retrait"],rep:"Précommande enregistrée"},
  reservation:{nom:"Réservation d’articles",besoins:["Mettre des articles de côté","Présenter vos produits","Organiser le retrait en boutique"],rep:"Articles mis de côté"},
  devis:{nom:"Demande de devis",besoins:["Recevoir des demandes de devis","Présenter vos domaines d’intervention","Être joint rapidement"],rep:"Demande de devis enregistrée"},
  cours:{nom:"Réservation de cours",besoins:["Recevoir des réservations de cours","Présenter votre planning","Présenter vos formules"],rep:"Place proposée"},
  session:{nom:"Réservation de séances",besoins:["Recevoir des réservations de séances","Présenter vos activités","Tenir à jour vos informations pratiques"],rep:"Créneau proposé"}};
var SANS_PAIEMENT={nom:"Sans paiement en ligne",court:"Sans paiement",desc:"Le rendez-vous est enregistré sans paiement en ligne ; le règlement se fait sur place."};
function li(icon,html){return "<li>"+icon+"<span>"+html+"</span></li>";}
function render(m){
  var F=DATA.familles[m.fam],mode=MODE[m.mode]||MODE.rdv,sante=m.fam==="sante";
  var pay=sante?SANS_PAIEMENT:(DATA.paiements[m.paiement]||DATA.paiements.aucun),online=!sante&&m.paiement!=="aucun";
  var tplDef=F[m.tpl]||F.A;
  var h='<header class="dr-card-h" style="--c:'+esc(m.couleur||"#1F77E9")+'">'+
    '<span class="dr-card-ico"><svg class="dr-i" aria-hidden="true"><use href="#mi-'+esc(m.icon)+'"/></svg></span>'+
    '<div class="dr-card-tt"><p class="eyebrow">'+esc(F.nom)+'</p><h2 id="t-pres" tabindex="-1">'+esc(m.nom)+'</h2>'+
    '<p class="dr-card-sub"><span>Parcours client :</span> <b>'+esc(mode.nom)+'</b></p></div>'+
    '<img class="dr-card-rb" src="'+rsrc(m.fam,528)+'" width="1056" height="1528" alt="" loading="lazy" decoding="async">'+
    '</header>';
  h+='<div class="dr-grid"><div class="dr-col">';
  h+='<section class="dr-blk"><h3>Vos besoins</h3><ul>'+mode.besoins.map(function(b){return li(I.need,esc(b));}).join("")+'</ul></section>';
  h+='<section class="dr-blk"><h3>Les atouts à mettre en avant</h3><ul class="dr-tags">'+m.atouts.map(function(a){return "<li>"+esc(a)+"</li>";}).join("")+'</ul>'+
    '<p class="dr-mini">Exemples : vous les remplacez par les vôtres.</p></section>';
  h+='</div>';
  h+='<section class="dr-blk dr-ok"><h3><span>Dans votre modèle</span> <span class="dr-badge ok">Disponible</span></h3><ul>'+
    li(I.ok,'<b>Site vitrine à votre image</b> <span>Deux modèles au choix :</span> <span>'+esc(F.A.nom)+'</span> · <span>'+esc(F.B.nom)+'</span>')+
    li(I.ok,'<b>Bouton d’action</b> <span class="dr-ctab">'+esc(m.cta)+'</span> <span>'+esc(mode.nom)+'</span>')+
    (online?"":li(I.ok,'<b>'+esc(pay.nom)+'</b> <span>'+esc(pay.desc)+'</span>'))+
    li(I.ok,'<b>Mots-clés de départ pour le référencement</b><span class="dr-seo" lang="fr" translate="no" data-i18n-skip>'+esc(m.seo.join(" · "))+'</span>')+
    '</ul></section>';
  h+='<section class="dr-blk dr-opt"><h3><span>Options sur mesure</span> <span class="dr-badge opt">Sur devis</span></h3><ul>'+
    li(I.opt,'<b>Secrétaire IA</b> <span>Configurée pour votre activité, elle répond à vos clients au téléphone.</span> <a href="telephone-ia.html">En savoir plus</a>')+
    (online?li(I.opt,'<b><span>Paiement en ligne</span> : <span>'+esc(pay.nom)+'</span></b> <span>'+esc(pay.desc)+'</span>'):"")+
    (sante?"":li(I.opt,'<b>Campagne ADS</b> <span>Une communication adaptée à votre activité.</span> <a href="campagne-ads.html">En savoir plus</a>'))+
    li(I.opt,'<b>Intégrations</b> <span>Les liens avec les outils que vous utilisez déjà.</span>')+
    '</ul></section>';
  h+='</div>';
  var ap=m.appel||{};
  h+='<section class="dr-journey" aria-labelledby="t-journey"><h3 id="t-journey"><span>Exemple de parcours client</span> <span class="dr-badge">Exemple fictif</span></h3><ol>'+
    '<li><span class="dr-step-k">Votre client</span><q>'+esc(ap.client)+'</q></li>'+
    '<li><span class="dr-step-k">Réponse</span><p><b>'+esc(mode.rep)+'</b></p><p><span>'+esc(ap.item)+'</span> · <span>'+esc(ap.quand)+'</span></p></li>'+
    '<li><span class="dr-step-k">Confirmation</span><p><b>'+esc(pay.nom)+'</b></p><p>'+esc(pay.desc)+'</p></li>'+
    '</ol><p class="dr-mini">Exemple fictif, à titre d’illustration : noms, prestations et horaires sont inventés.</p></section>';
  if(sante)h+='<div class="dr-health" role="note">'+I.info+'<div><b>Santé : un cadre strict</b>'+
    '<p>Pas d’avis clients, pas de paiement en ligne, pas de publicité. L’assistant ne donne aucun conseil médical : il s’en tient à l’organisation des rendez-vous et aux informations pratiques. En cas d’urgence, le site rappelle d’appeler le 15 (SAMU) ou le 112.</p>'+
    '<p>Les données de rendez-vous doivent être confiées à un hébergeur certifié HDS : point à prévoir avec votre conseiller.</p></div></div>';
  h+='<div class="dr-cta"><button class="btn btn-cyan" type="button" data-open-rappel data-metier aria-controls="rappel" aria-expanded="false">Construire ma solution '+I.arrow+'</button>'+
    '<a class="btn btn-line" href="#modeles">Voir les modèles</a><a class="link" href="demo.html'+(m.fam==="artisan"?"?secteur=batiment":"")+'">Découvrir une démo</a></div>';
  show(h,m.fam);}
function renderAutre(){
  var h='<header class="dr-card-h"><span class="dr-card-ico">'+I.opt+'</span><div class="dr-card-tt"><p class="eyebrow">Activité sur mesure</p>'+
    '<h2 id="t-pres" tabindex="-1">Votre métier n’est pas dans la liste ?</h2>'+
    '<p class="dr-card-sub">Présentez votre activité à votre conseiller : votre solution est construite à partir de vos besoins.</p></div>'+
    '<img class="dr-card-rb" src="'+rsrc("neutre",528)+'" width="1056" height="1528" alt="" loading="lazy" decoding="async"></header>'+
    '<div class="dr-grid"><section class="dr-blk"><h3>Ce que nous préparons ensemble</h3><ul>'+
    li(I.need,"Votre web app, à votre image")+li(I.need,"Les agents IA utiles à votre organisation")+li(I.need,"Les liens avec les outils que vous utilisez déjà.")+
    '</ul></section><section class="dr-blk"><h3>Pour commencer</h3><ul>'+
    li(I.need,"Décrivez votre activité, vos clients et ce que vous souhaitez simplifier.")+li(I.need,"Votre conseiller vous rappelle et vous recevez un devis personnalisé.")+
    '</ul></section></div>'+
    '<div class="dr-cta"><button class="btn btn-cyan" type="button" data-open-rappel data-metier aria-controls="rappel" aria-expanded="false">Présenter mon activité '+I.arrow+'</button>'+
    '<a class="btn btn-line" href="#modeles">Voir les modèles</a></div>';
  show(h,"");}
function show(h,fam){var c=$("dr-card"),h0=$("dr-pres-empty").querySelector("h2");if(h0)h0.removeAttribute("id");c.innerHTML=h;c.hidden=false;c.dataset.fam=fam;$("dr-pres-empty").hidden=true;
  var sec=$("rappel");if(sec&&!sec.hidden)c.querySelectorAll("[data-open-rappel]").forEach(function(b){b.setAttribute("aria-expanded","true");});}

/* ---------- aperçus des modèles (captures de la démo de l’archive : commerces fictifs) ---------- */
function shot(f,v,def){var F=DATA.familles[f],M=F[v];
  return '<figure class="dr-shot"><button type="button" data-lb="'+f+'-'+v+'" aria-haspopup="dialog">'+
    '<img src="assets/dressing/modeles/'+f+'-'+v+'-640.webp" width="640" height="400" loading="lazy" decoding="async" alt="Aperçu du modèle : maquette de démonstration, commerce fictif.">'+
    '<span class="dr-badge">Exemple fictif</span>'+(def?'<span class="dr-badge def">Modèle de départ</span>':'')+'</button>'+
    '<figcaption><b><span>Modèle</span> '+esc(M.nom)+'</b><span>'+esc(M.desc)+'</span></figcaption></figure>';}
function models(f,tpl){
  var pair=$("dr-mod-pair"),all=$("dr-mod-all");
  if(f&&DATA.familles[f]){pair.innerHTML='<p class="dr-mod-fam" style="grid-column:1/-1"><span>Famille choisie :</span> <b>'+esc(DATA.familles[f].nom)+'</b></p>'+shot(f,"A",tpl==="A")+shot(f,"B",tpl==="B");all.open=false;}
  else{pair.innerHTML="";all.open=true;}}
function grid(){$("dr-mod-grid").innerHTML=DATA.ordre.map(function(f){return shot(f,"A")+shot(f,"B");}).join("");}
var lb=$("dr-lb"),lbFrom=null;
D.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-lb]");if(!b||!DATA)return;
  var k=b.dataset.lb.split("-"),F=DATA.familles[k[0]],M=F&&F[k[1]];if(!M)return;
  lbFrom=b;$("dr-lb-img").src="assets/dressing/modeles/"+k[0]+"-"+k[1]+"-1280.webp";
  $("dr-lb-img").alt=b.querySelector("img").alt;$("dr-lb-t").innerHTML="<span>"+esc(F.nom)+"</span> — <span>"+esc(M.nom)+"</span>";
  if(lb.showModal)lb.showModal();else lb.setAttribute("open","");});
$("dr-lb-x").addEventListener("click",function(){lb.close?lb.close():lb.removeAttribute("open");});
lb.addEventListener("click",function(e){if(e.target===lb)lb.close();});
lb.addEventListener("close",function(){if(lbFrom)lbFrom.focus();});

/* ---------- interface publique (formulaire de rappel) ---------- */
window.VP_DRESSING={current:function(){
  if(state.autre)return {autre:true,id:"autre",nom:"",fam:"",famNom:""};
  var m=state.id&&BY[state.id];return m?{autre:false,id:m.id,nom:m.nom,fam:m.fam,famNom:famName(m.fam)}:null;}};

/* ---------- données ---------- */
fetch("assets/metiers/metiers.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(function(d){
  DATA=d;d.metiers.forEach(function(m){BY[m.id]=m;});grid();
  var p=null;try{p=new URLSearchParams(location.search);}catch(e){}
  var id=p&&p.get("metier"),sect=p&&p.get("secteur");
  if(id==="autre")$("dr-autre").click();
  else if(id&&BY[id])select(id,{from:"load"});
  else if(sect==="sante")setFam("sante");
  else models("",null);
  filter();
  /* préchargement discret des tenues les plus probables quand la page est au repos (connexion rapide seulement) */
  var c=navigator.connection;if(!(c&&(c.saveData||/2g/.test(c.effectiveType||"")))){
    var idle=window.requestIdleCallback||function(f){return setTimeout(f,1800);};
    idle(function(){["sante","beaute","artisan"].forEach(intent);});}
}).catch(function(){
  /* données indisponibles : la liste reste lisible, la recherche se limite aux noms affichés */
  DATA=null;$("dr-mod-pair").innerHTML="";});
})();
