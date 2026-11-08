/* Vision Plus — service worker (PWA). Activé seulement en production (https, hors cadre).
   Stratégie : réseau d'abord pour tout (pages et fichiers), avec revalidation auprès du serveur ;
   le cache ne sert qu'en l'absence de connexion. Une nouvelle version du site est donc visible
   dès le chargement suivant (et mobile.js recharge la page quand une nouvelle version prend la main). */
var V="vp-v29";
var SHELL=["index.html","decouvrir.html","demo.html","offre-sur-mesure.html","faq.html","sav.html","connexion.html","inscription.html","assets/site.css","themes/p1.css","assets/mobile.css","assets/site.js","assets/mobile.js","assets/config.js","assets/data.js","assets/theme.js","themes/p1.js","assets/brand/vp-logo.webp","assets/brand/vp-mark.webp","assets/brand/icon-192.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL.map(function(u){return new Request(u,{cache:"reload"});}));}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){var r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==location.origin||r.headers.has("range"))return;   /* audio/vidéo par plages : laissés au navigateur */
  var fresh=new Request(r.url,{cache:"no-cache",credentials:"same-origin"});
  e.respondWith(fetch(fresh).then(function(res){
    if(res&&res.ok&&res.type==="basic"){var cp=res.clone();caches.open(V).then(function(c){c.put(r.url,cp);});}
    return res;
  }).catch(function(){return caches.match(r.url).then(function(m){return m||(r.mode==="navigate"?caches.match("index.html"):Response.error());});}));});
