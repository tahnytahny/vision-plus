/* AXIA — service worker (PWA). Activé seulement en production (https, hors cadre).
   Stratégie : réseau d'abord pour les pages, cache d'abord pour les fichiers statiques. */
var V="axia-v6";
var SHELL=["index.html","decouvrir.html","demo.html","abonnements.html","faq.html","sav.html","connexion.html","inscription.html","assets/axia.css","themes/p1.css","assets/mobile.css","assets/axia.js","assets/mobile.js","assets/config.js","assets/data.js","assets/theme.js","themes/p1.js","assets/logo-t.webp","assets/logo-mark-t.webp","assets/icon-192.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V;}).map(function(x){return caches.delete(x);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener("fetch",function(e){var r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp);});return res;}).catch(function(){return caches.match(r).then(function(m){return m||caches.match("index.html");});}));return;}
  e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp);});return res;});}));});
