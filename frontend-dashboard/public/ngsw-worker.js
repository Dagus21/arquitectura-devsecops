/* SAFETY WORKER - ASESINO DE CACHÉ */
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  
  // 1. Desregistrar inmediatamente este Service Worker
  self.registration.unregister().then(() => {
    console.log('💀 Safety Worker: Service Worker eliminado correctamente.');
  });

  // 2. Borrar TODOS los cachés antiguos
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