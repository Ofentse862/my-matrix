// Increase VERSION whenever shipped files change.
const VERSION='matrix-v2.0.0';
const ASSETS=['./','./index.html','./style.css','./model.js','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS)));
  // Waiting for old tabs to close avoids mixing old HTML with new scripts.
});
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>(key.startsWith('matrix-v')||key.startsWith('little-order-'))&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
