/* Vision Plus — langues du site.
   - Sélecteur (globe + langue active) avec barre de recherche ; chaque langue s'affiche dans sa propre écriture.
   - Changement immédiat sur la page en cours, sans rechargement, puis sur toutes les pages suivantes (choix mémorisé).
   - Traductions préparées à l'avance par Claude : assets/i18n/src.json (textes français) et assets/i18n/<code>.json
     (mêmes textes, même ordre, dans la langue). Seules les langues dont la traduction est complète sont proposées
     (assets/i18n/index.json). Le français est la langue d'origine : on peut y revenir à tout moment.
   - Hébreu, arabe, persan, ourdou : lecture de droite à gauche.
   - Les textes ajoutés ensuite par les scripts (menus, messages, formulaires) sont traduits à leur apparition. */
(function(){
"use strict";
if(window.VP_I18N)return;
var D=document,H=D.documentElement,KEY="vp.lang";
var me=D.currentScript&&D.currentScript.src||"";
var BASE=me?me.replace(/[^\/]*$/,"")+"i18n/":"assets/i18n/";

/* catalogue : code, nom dans sa propre écriture, nom français, nom anglais */
var CATALOG=[
 ["fr","Français","Français","French"],["en","English","Anglais","English"],["it","Italiano","Italien","Italian"],
 ["he","עברית","Hébreu","Hebrew"],["ar","العربية","Arabe","Arabic"],["es","Español","Espagnol","Spanish"],
 ["de","Deutsch","Allemand","German"],["pt","Português","Portugais","Portuguese"],["ru","Русский","Russe","Russian"],
 ["zh","中文（简体）","Chinois simplifié","Chinese (Simplified)"],["zh-Hant","中文（繁體）","Chinois traditionnel","Chinese (Traditional)"],
 ["ja","日本語","Japonais","Japanese"],["ko","한국어","Coréen","Korean"],["tr","Türkçe","Turc","Turkish"],
 ["nl","Nederlands","Néerlandais","Dutch"],["pl","Polski","Polonais","Polish"],["el","Ελληνικά","Grec","Greek"],
 ["hi","हिन्दी","Hindi","Hindi"],["uk","Українська","Ukrainien","Ukrainian"],["ro","Română","Roumain","Romanian"],
 ["sv","Svenska","Suédois","Swedish"],["da","Dansk","Danois","Danish"],["nb","Norsk bokmål","Norvégien","Norwegian"],
 ["fi","Suomi","Finnois","Finnish"],["cs","Čeština","Tchèque","Czech"],["sk","Slovenčina","Slovaque","Slovak"],
 ["hu","Magyar","Hongrois","Hungarian"],["bg","Български","Bulgare","Bulgarian"],["hr","Hrvatski","Croate","Croatian"],
 ["sr","Српски","Serbe","Serbian"],["sl","Slovenščina","Slovène","Slovenian"],["lt","Lietuvių","Lituanien","Lithuanian"],
 ["lv","Latviešu","Letton","Latvian"],["et","Eesti","Estonien","Estonian"],["vi","Tiếng Việt","Vietnamien","Vietnamese"],
 ["th","ไทย","Thaï","Thai"],["id","Bahasa Indonesia","Indonésien","Indonesian"],["ms","Bahasa Melayu","Malais","Malay"],
 ["fil","Filipino","Filipino","Filipino"],["fa","فارسی","Persan","Persian"],["ur","اردو","Ourdou","Urdu"],
 ["bn","বাংলা","Bengali","Bengali"],["ta","தமிழ்","Tamoul","Tamil"],["te","తెలుగు","Télougou","Telugu"],
 ["mr","मराठी","Marathi","Marathi"],["gu","ગુજરાતી","Gujarati","Gujarati"],["kn","ಕನ್ನಡ","Kannada","Kannada"],
 ["ml","മലയാളം","Malayalam","Malayalam"],["pa","ਪੰਜਾਬੀ","Pendjabi","Punjabi"],["ne","नेपाली","Népalais","Nepali"],
 ["si","සිංහල","Cingalais","Sinhala"],["sw","Kiswahili","Swahili","Swahili"],["am","አማርኛ","Amharique","Amharic"],
 ["ca","Català","Catalan","Catalan"],["eu","Euskara","Basque","Basque"],["gl","Galego","Galicien","Galician"],
 ["ga","Gaeilge","Irlandais","Irish"],["cy","Cymraeg","Gallois","Welsh"],["is","Íslenska","Islandais","Icelandic"],
 ["sq","Shqip","Albanais","Albanian"],["mk","Македонски","Macédonien","Macedonian"],["bs","Bosanski","Bosnien","Bosnian"],
 ["hy","Հայերեն","Arménien","Armenian"],["ka","ქართული","Géorgien","Georgian"],["az","Azərbaycan dili","Azéri","Azerbaijani"],
 ["kk","Қазақ тілі","Kazakh","Kazakh"],["uz","Oʻzbekcha","Ouzbek","Uzbek"],["mn","Монгол","Mongol","Mongolian"],
 ["km","ខ្មែរ","Khmer","Khmer"],["lo","ລາວ","Lao","Lao"],["my","မြန်မာ","Birman","Burmese"],
 ["af","Afrikaans","Afrikaans","Afrikaans"],["zu","isiZulu","Zoulou","Zulu"],["xh","isiXhosa","Xhosa","Xhosa"],
 ["yo","Yorùbá","Yoruba","Yoruba"],["ig","Igbo","Igbo","Igbo"],["ha","Hausa","Haoussa","Hausa"],["so","Soomaali","Somali","Somali"],
 ["mg","Malagasy","Malgache","Malagasy"],["ht","Kreyòl ayisyen","Créole haïtien","Haitian Creole"],["lb","Lëtzebuergesch","Luxembourgeois","Luxembourgish"],
 ["mt","Malti","Maltais","Maltese"],["la","Latina","Latin","Latin"],["eo","Esperanto","Espéranto","Esperanto"]
];
var RTL={ar:1,he:1,fa:1,ur:1};
var BY={};CATALOG.forEach(function(l){BY[l[0]]=l;});

/* ---------- état ---------- */
var avail=["fr"],cur="fr",want="fr",dict=null,src=null,cache={},origTitle=null,mo=null,ready=false;
function store(v){try{if(v==="fr")localStorage.removeItem(KEY);else localStorage.setItem(KEY,v);}catch(e){}}
function stored(){try{return localStorage.getItem(KEY)||"";}catch(e){return "";}}
(function(){var q="";try{q=new URLSearchParams(location.search).get("lang")||"";}catch(e){}
  want=(q&&BY[q]?q:stored())||"fr";if(!BY[want])want="fr";})();
/* tant que la langue mémorisée n'est pas appliquée, la page reste masquée (évite d'apercevoir le français) */
var st=D.createElement("style");st.textContent="html.i18n-wait body{visibility:hidden}";(D.head||H).appendChild(st);
function setDir(code){H.lang=code==="zh-Hant"?"zh-Hant":code;H.dir=RTL[code]?"rtl":"ltr";}
if(want!=="fr"){H.classList.add("i18n-wait");setDir(want);setTimeout(function(){H.classList.remove("i18n-wait");},3500);}

/* ---------- découpage du texte en segments (identique à l'extraction des textes à traduire) ---------- */
var SKIP={SCRIPT:1,STYLE:1,NOSCRIPT:1,TEMPLATE:1,TEXTAREA:1,PRE:1,svg:1,SVG:1,IFRAME:1,CANVAS:1,VIDEO:1,AUDIO:1,OBJECT:1,MATH:1};
var INLINE={A:1,B:1,STRONG:1,EM:1,I:1,U:1,S:1,SMALL:1,MARK:1,SPAN:1,BR:1,SUP:1,SUB:1,ABBR:1,TIME:1,CODE:1,Q:1,CITE:1,DFN:1,KBD:1,WBR:1,DEL:1,INS:1,BDI:1};
var LETTERS=/[A-Za-zÀ-ÖØ-öø-ÿŒœ]{2}/;
var ATTRS=["title","aria-label","placeholder","alt","aria-description","data-tip"];
function norm(s){return String(s).replace(/[\s ]+/g,function(m){return m.indexOf(" ")>-1&&m.length===1?" ":" ";}).trim();}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/ /g,"&nbsp;");}
function unesc(s){return String(s).replace(/&nbsp;/g," ").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&");}
function skipEl(e){return e.nodeType!==1||SKIP[e.nodeName]||e.hasAttribute("data-i18n-skip")||e.getAttribute("translate")==="no"||e.isContentEditable===true;}
function inlineRich(e){if(e.hasAttribute&&e.hasAttribute("data-i18n-split"))return false;for(var n=e.firstChild;n;n=n.nextSibling){if(n.nodeType===3||n.nodeType===8)continue;
  if(n.nodeType!==1||!INLINE[n.nodeName]||skipEl(n)||!inlineRich(n))return false;}return true;}
function isTop(e){return e===D.body||e===H||e===D.head;}
function directText(e){for(var n=e.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&/\S/.test(n.data))return true;}return false;}
function walk(root,onEl,onText){if(!root||skipEl(root))return;
  if(!isTop(root)&&inlineRich(root)&&directText(root)){if(LETTERS.test(root.textContent)||root.__vpOrig!==undefined)onEl(root);return;}
  for(var n=root.firstChild;n;n=n.nextSibling){
    if(n.nodeType===3){if(LETTERS.test(n.data)||n.__vpOrig!==undefined)onText(n);}
    else if(n.nodeType===1)walk(n,onEl,onText);}}
function segRoot(e){var path=[e];while(e&&e.parentElement&&!isTop(e.parentElement)&&!skipEl(e.parentElement)&&inlineRich(e.parentElement)){e=e.parentElement;path.unshift(e);}
  for(var i=0;i<path.length;i++){if(inlineRich(path[i])&&directText(path[i]))return path[i];}return path[path.length-1];}
function inSkipped(n){for(var e=n.nodeType===1?n:n.parentElement;e;e=e.parentElement){if(skipEl(e))return true;}return false;}
function keyOfEl(e){return norm(e.innerHTML);}
function keyOfText(t){return esc(norm(t));}

/* ---------- application d'une traduction ---------- */
function sameAttrs(a,b){if(a.attributes.length!==b.attributes.length)return false;
  for(var i=0;i<a.attributes.length;i++){var x=a.attributes[i];if(b.getAttribute(x.name)!==x.value)return false;}return true;}
function sameShape(a,b){var x=a.childNodes,y=b.childNodes;if(x.length!==y.length)return false;
  for(var i=0;i<x.length;i++){if(x[i].nodeType!==y[i].nodeType)return false;
    if(x[i].nodeType===1&&(x[i].nodeName!==y[i].nodeName||!sameAttrs(x[i],y[i])||!sameShape(x[i],y[i])))return false;}return true;}
function copyText(a,b){for(var i=0;i<a.childNodes.length;i++){var x=a.childNodes[i],y=b.childNodes[i];
  if(x.nodeType===3){if(x.data!==y.data)x.data=y.data;}else if(x.nodeType===1)copyText(x,y);}}
/* garde les éléments existants (et leurs écouteurs) quand la structure est identique */
function setHTML(e,html){var t=D.createElement("template");t.innerHTML=html;
  if(sameShape(e,t.content))copyText(e,t.content);else e.innerHTML=html;}
var dictN=null,tpl=null;
function prep(m){dictN=new Map();tpl=[];if(!m)return;
  m.forEach(function(v,k){
    if(/\{\d\}/.test(k)){var rx=k.replace(/[.*+?^$()|[\]\\]/g,"\\$&").replace(/\\?\{(\d)\\?\}/g,"(.+?)");try{tpl.push({re:new RegExp("^"+rx+"$"),v:v,n:k.length});}catch(e){}}
    else if(/\d/.test(k)){var a=k.match(/\d+/g),b=v.match(/\d+/g);if(b&&a.length===b.length){var nk=k.replace(/\d+/g,"#");if(!dictN.has(nk))dictN.set(nk,v);}}});
  tpl.sort(function(a,b){return b.n-a.n;});}
var depth=0;
function capT(c){var v;if(depth<3){depth++;try{v=lookup(c);}finally{depth--;}}else v=dict.get(c);if(v!=null)return v;
  if(c.indexOf(", ")>-1){var parts=c.split(", "),ok=false;parts=parts.map(function(x){var y=dict.get(x);if(y!=null){ok=true;return y;}return x;});if(ok)return parts.join(", ");}
  return c;}
function lookup(k){if(!dict)return undefined;var v=dict.get(k);if(v!=null)return v;
  if(/\d/.test(k)){var e=dictN.get(k.replace(/\d+/g,"#"));if(e!=null){var ds=k.match(/\d+/g),i=0;return e.replace(/\d+/g,function(){return ds[i++];});}}
  for(var j=0;j<tpl.length;j++){var m=tpl[j].re.exec(k);if(m)return tpl[j].v.replace(/\{(\d)\}/g,function(_,n){var c=m[+n+1];return c==null?"":capT(c);});}
  return undefined;}
function applyEl(e){
  if(e.nodeName==="OPTION"&&!e.hasAttribute("value"))e.setAttribute("value",e.__vpOrig!==undefined?unesc(norm(e.__vpOrig.replace(/<[^>]*>/g,""))):e.textContent.trim());
  if(e.__vpOut===undefined||e.innerHTML!==e.__vpOut){e.__vpOrig=e.innerHTML;e.__vpKey=keyOfEl(e);e.__vpPartial=false;}
  var out=cur==="fr"?e.__vpOrig:lookup(e.__vpKey);
  if(out==null){
    /* bloc avec une valeur variable non prévue (date, nom…) : on traduit au moins ses parties connues */
    if(cur!=="fr"){partial(e);e.__vpPartial=true;e.__vpOut=e.innerHTML;}else e.__vpOut=undefined;
    return;}
  if(e.innerHTML!==out)setHTML(e,out);
  e.__vpPartial=false;e.__vpOut=e.innerHTML;}
function partial(e){for(var n=e.firstChild;n;n=n.nextSibling){
  if(n.nodeType===3){if(LETTERS.test(n.data)||n.__vpOrig!==undefined)applyText(n);}
  else if(n.nodeType===1&&!skipEl(n)){if(inlineRich(n)&&directText(n))applyEl(n);else walk(n,applyEl,applyText);}}}
function applyText(t){
  if(t.__vpOut===undefined||t.data!==t.__vpOut){t.__vpOrig=t.data;t.__vpKey=keyOfText(t.data);}
  var out;
  if(cur==="fr")out=t.__vpOrig;
  else{var v=lookup(t.__vpKey);if(v==null){t.__vpOut=undefined;return;}
    var m=/^[\s ]*/.exec(t.__vpOrig)[0],n=/[\s ]*$/.exec(t.__vpOrig)[0];out=m+unesc(v)+n;}
  if(t.data!==out)t.data=out;
  t.__vpOut=t.data;}
function applyAttrs(e){
  var o=e.__vpA||(e.__vpA={});
  ATTRS.forEach(function(a){if(!e.hasAttribute(a))return;var v=e.getAttribute(a);
    if(!o[a]||v!==o[a].out){o[a]={orig:v,key:esc(norm(v))};}
    if(!LETTERS.test(o[a].orig))return;
    var out=cur==="fr"?o[a].orig:lookup(o[a].key);
    if(out==null){o[a].out=v;return;}
    out=cur==="fr"?out:unesc(out);if(v!==out)e.setAttribute(a,out);o[a].out=out;});
  if(e.nodeName==="INPUT"&&/^(submit|button|reset)$/i.test(e.type)&&e.value){
    var x=e.__vpV;if(!x||e.value!==x.out)x=e.__vpV={orig:e.value,key:esc(norm(e.value))};
    var w=cur==="fr"?x.orig:lookup(x.key);if(w!=null){w=cur==="fr"?w:unesc(w);if(e.value!==w)e.value=w;x.out=w;}}}
function attrsIn(root){if(root.nodeType!==1||inSkipped(root))return;
  var sel="["+ATTRS.join("],[")+"],input[type=submit],input[type=button]";
  if(root.matches&&root.matches(sel))applyAttrs(root);
  [].forEach.call(root.querySelectorAll(sel),function(e){if(!inSkipped(e))applyAttrs(e);});}
function translate(root){if(!root)return;
  if(root.nodeType===3){if(!inSkipped(root)&&(LETTERS.test(root.data)||root.__vpOrig!==undefined))applyText(root);return;}
  if(root.nodeType!==1||inSkipped(root))return;
  walk(root,applyEl,applyText);attrsIn(root);}
function title(){if(origTitle===null||D.title!==title.out)origTitle=D.title;
  var out=cur==="fr"?origTitle:lookup(esc(norm(origTitle)));
  if(out!=null){out=cur==="fr"?out:unesc(out);if(D.title!==out)D.title=out;}title.out=D.title;}

/* ---------- suivi des contenus ajoutés par les scripts ---------- */
function observe(){if(mo||!D.body)return;
  mo=new MutationObserver(function(recs){if(cur==="fr"&&!dict)return;var set=[];
    recs.forEach(function(r){
      if(r.type==="childList"){[].forEach.call(r.addedNodes,function(n){if(n.nodeType===1)set.push(segRoot(n));else if(n.nodeType===3&&n.parentElement)set.push(segRoot(n.parentElement));});
        if(r.target.nodeType===1&&r.addedNodes.length)set.push(segRoot(r.target));}
      else if(r.type==="characterData"){var p=r.target.parentElement;if(p)set.push(segRoot(p));}
      else if(r.type==="attributes"&&r.target.nodeType===1&&!inSkipped(r.target))applyAttrs(r.target);});
    set.forEach(function(n){if(n&&n.isConnected)translate(n);});
    if(D.title!==title.out)title();
    mo.takeRecords();});
  mo.observe(D.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS.concat(["value"])});
  var tt=D.querySelector("title");if(tt)new MutationObserver(function(){if(D.title!==title.out)title();}).observe(tt,{childList:true,characterData:true,subtree:true});}
function translateAll(){translate(D.body);title();if(mo)mo.takeRecords();}

/* ---------- chargement des traductions ---------- */
function getJSON(u){return fetch(u,{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();});}
function loadDict(code){if(code==="fr")return Promise.resolve(null);if(cache[code])return Promise.resolve(cache[code]);
  return Promise.all([src?Promise.resolve(src):getJSON(BASE+"src.json"),getJSON(BASE+code+".json")]).then(function(a){
    src=a[0];var t=a[1].t||a[1],m=new Map();
    for(var i=0;i<src.length;i++){if(typeof t[i]==="string"&&t[i])m.set(src[i],t[i]);}
    cache[code]=m;return m;});}
function domReady(){return new Promise(function(r){if(D.readyState!=="loading")r();else D.addEventListener("DOMContentLoaded",r,{once:true});});}
var busy=null;
function setLang(code,save){if(!BY[code]||(code!=="fr"&&avail.indexOf(code)<0&&ready))code="fr";
  if(save!==false)store(code);
  var job=loadDict(code).then(function(m){return domReady().then(function(){
      cur=code;dict=m;prep(m);setDir(code);H.classList.toggle("i18n-on",code!=="fr");translateAll();observe();
      H.classList.remove("i18n-wait");updateUI();
      try{D.dispatchEvent(new CustomEvent("vp:lang",{detail:{lang:code,dir:H.dir}}));}catch(e){}});})
    .catch(function(){H.classList.remove("i18n-wait");if(code!=="fr"){store("fr");return setLang("fr",false);}});
  busy=job;return job;}

/* ---------- sélecteur ---------- */
var GLOBE='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/></svg>';
var CHECK='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"/></svg>';
var panel=null,btns=[],opener=null;
function short(code){return code==="zh-Hant"?"ZH":code.slice(0,2).toUpperCase();}
function fold(s){return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
function makeBtn(cls){var b=D.createElement("button");b.type="button";b.className="vlang-btn "+cls;b.setAttribute("aria-haspopup","dialog");b.setAttribute("aria-expanded","false");
  b.innerHTML=GLOBE+'<span class="vlang-cur" translate="no" data-i18n-skip></span><span class="sr">Langue</span>';
  b.addEventListener("click",function(e){e.stopPropagation();if(panel&&panel.hasAttribute("data-open")&&opener===b)closeP(true);else openP(b);});
  btns.push(b);return b;}
function updateUI(){btns.forEach(function(b){b.querySelector(".vlang-cur").textContent=short(cur);b.querySelector(".vlang-cur").setAttribute("lang",cur);});
  if(panel)renderList(panel.querySelector(".vlang-q").value);}
function buildPanel(){if(panel)return;panel=D.createElement("div");panel.className="vlang-p";panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Choisir la langue du site");
  panel.innerHTML='<div class="vlang-h"><span class="vlang-t">Langue du site</span><button type="button" class="vlang-x" aria-label="Fermer">×</button></div>'+
    '<label class="vlang-s"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="sr">Rechercher une langue</span><input class="vlang-q" type="search" autocomplete="off" spellcheck="false" placeholder="Rechercher une langue"></label>'+
    '<ul class="vlang-l" role="listbox" aria-label="Langues disponibles" data-i18n-skip></ul><p class="vlang-none" hidden>Aucune langue trouvée.</p>';
  D.body.appendChild(panel);
  var q=panel.querySelector(".vlang-q"),list=panel.querySelector(".vlang-l");
  q.addEventListener("input",function(){renderList(q.value);});
  q.addEventListener("keydown",function(e){var it=list.querySelectorAll(".vlang-o");
    if(e.key==="ArrowDown"&&it.length){e.preventDefault();it[0].focus();}
    else if(e.key==="Enter"&&it.length){e.preventDefault();pick(it[0].getAttribute("data-c"));}});
  list.addEventListener("keydown",function(e){var it=[].slice.call(list.querySelectorAll(".vlang-o")),i=it.indexOf(D.activeElement);
    if(e.key==="ArrowDown"){e.preventDefault();(it[i+1]||it[0]).focus();}
    else if(e.key==="ArrowUp"){e.preventDefault();if(i<=0)q.focus();else it[i-1].focus();}
    else if(e.key==="Home"){e.preventDefault();it[0].focus();}else if(e.key==="End"){e.preventDefault();it[it.length-1].focus();}});
  list.addEventListener("click",function(e){var o=e.target.closest(".vlang-o");if(o)pick(o.getAttribute("data-c"));});
  panel.querySelector(".vlang-x").addEventListener("click",function(){closeP(true);});
  panel.addEventListener("click",function(e){e.stopPropagation();});
  D.addEventListener("click",function(){if(panel.hasAttribute("data-open"))closeP(false);});
  D.addEventListener("keydown",function(e){if(e.key==="Escape"&&panel.hasAttribute("data-open")){e.preventDefault();closeP(true);}});
  window.addEventListener("resize",function(){if(panel.hasAttribute("data-open"))place();});}
function renderList(query){var list=panel.querySelector(".vlang-l"),f=fold(query||"").trim();
  var rows=avail.map(function(c){return BY[c];}).filter(function(l){return l&&(!f||[l[0],l[1],l[2],l[3]].some(function(x){return fold(x).indexOf(f)>-1;}));});
  rows.sort(function(a,b){if(a[0]==="fr")return -1;if(b[0]==="fr")return 1;return a[1].localeCompare(b[1],"en");});
  list.innerHTML=rows.map(function(l){var on=l[0]===cur;
    return '<li role="none"><button type="button" role="option" class="vlang-o" data-c="'+l[0]+'" lang="'+l[0]+'" dir="'+(RTL[l[0]]?"rtl":"ltr")+'" aria-selected="'+on+'"><span class="vlang-n">'+l[1]+'</span><span class="vlang-k">'+short(l[0])+"</span>"+(on?CHECK:"")+"</button></li>";}).join("");
  panel.querySelector(".vlang-none").hidden=rows.length>0;}
function place(){var m=matchMedia("(max-width:760px)").matches;panel.classList.toggle("is-sheet",m);
  if(m){panel.style.left=panel.style.right=panel.style.top="";return;}
  var r=opener.getBoundingClientRect(),w=panel.offsetWidth,rtl=H.dir==="rtl";
  var left=rtl?r.left:r.right-w;left=Math.max(12,Math.min(left,innerWidth-w-12));
  panel.style.left=left+"px";panel.style.top=(r.bottom+10)+"px";panel.style.right="auto";}
function openP(b){buildPanel();opener=b;renderList("");panel.querySelector(".vlang-q").value="";panel.setAttribute("data-open","");place();
  btns.forEach(function(x){x.setAttribute("aria-expanded",x===b?"true":"false");});
  try{D.dispatchEvent(new Event("vp:lang-open"));}catch(e){}
  setTimeout(function(){var q=panel.querySelector(".vlang-q");if(q)q.focus({preventScroll:true});},30);}
function closeP(back){if(!panel)return;panel.removeAttribute("data-open");btns.forEach(function(x){x.setAttribute("aria-expanded","false");});if(back&&opener)opener.focus();}
function pick(code){closeP(true);if(code!==cur)setLang(code,true);}
function mount(){var top=D.querySelector("header.top .top-in");if(!top||top.querySelector(".vlang-btn"))return;
  var auth=top.querySelector(".vauth");
  if(auth)auth.insertBefore(makeBtn("vlang-d"),auth.firstChild);
  top.appendChild(makeBtn("vlang-m"));updateUI();
  try{window.dispatchEvent(new Event("resize"));}catch(e){}}

/* ---------- démarrage ---------- */
getJSON(BASE+"index.json").then(function(x){avail=["fr"].concat((x.langs||[]).filter(function(c){return BY[c]&&c!=="fr";}));})
  .catch(function(){}).then(function(){ready=true;if(want!=="fr"&&avail.indexOf(want)<0){want="fr";store("fr");H.classList.remove("i18n-wait");setDir("fr");}
    if(want!=="fr")setLang(want,false);else{cur="fr";setDir("fr");}updateUI();});
D.addEventListener("vp:ready",mount);
domReady().then(function(){setTimeout(mount,0);});

/* ---------- outils (extraction des textes à traduire, tests) ---------- */
window.VP_I18N={
  get lang(){return cur;},langs:function(){return avail.slice();},catalog:CATALOG,set:function(c){return setLang(c,true);},
  /* textes à traduire présents sous root (mêmes règles que l'affichage) */
  collect:function(root){var out=[];root=root||D.body;
    walk(root,function(e){out.push(keyOfEl(e));},function(t){out.push(keyOfText(t.data));});
    var sel="["+ATTRS.join("],[")+"]";[].forEach.call(root.querySelectorAll?root.querySelectorAll(sel):[],function(e){if(inSkipped(e))return;
      ATTRS.forEach(function(a){var v=e.getAttribute(a);if(v&&LETTERS.test(v))out.push(esc(norm(v)));});});
    [].forEach.call(root.querySelectorAll?root.querySelectorAll("input[type=submit],input[type=button]"):[],function(e){if(e.value&&LETTERS.test(e.value))out.push(esc(norm(e.value)));});
    return out;},
  /* textes d'un fragment HTML (chaînes des scripts) */
  collectHTML:function(html){var d=D.createElement("div");d.innerHTML=html;return this.collect(d);},
  /* textes visibles restés en français (contrôle) */
  leftovers:function(){var out=[];if(cur==="fr")return out;
    walk(D.body,function(e){if(e.__vpOut===undefined&&!inSkipped(e))out.push(keyOfEl(e));},function(t){if(t.__vpOut===undefined&&!inSkipped(t))out.push(keyOfText(t.data));});return out;}
};
})();
