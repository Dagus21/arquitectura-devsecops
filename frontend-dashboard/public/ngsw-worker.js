// src/safety-worker.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  
  // Desregistrar inmediatamente
  self.registration.unregister().then(() => {
    console.log('💀 Safety Worker: Service Worker eliminado.');
  });

  // Borrar todos los cachés
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('🗑️ Safety Worker: Borrando caché ' + cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});