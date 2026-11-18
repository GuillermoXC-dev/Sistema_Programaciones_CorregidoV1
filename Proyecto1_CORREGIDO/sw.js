const CACHE_NAME = 'tren-maya-cache-clima-v6';
const urlsToCache = [
  './clima-referencia.css?v=1',
  './encabezado-comun.css?v=1',
  './encabezado-comun.js?v=1',
  './dashboard.html',
  './index.html',
  './servicio-patio.html',
  './distribucion_personal.html',
  './incidencias.html',
  './combustible.html',
  './costos.html',
  './estilos.css',
  './proyecto1-unificado.css?v=3',
  './diseno-comun.css?v=3',
  './estilos-v2.css',
  './config.js',
  './temayin.js',
  './dashboard.js',
  './combustible.js',
  './costos.js',
  './incidencias.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Archivos principales en caché');
      return cache.addAll(urlsToCache);
    })
  );
});

// Interceptar peticiones para servir desde caché si no hay red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // Si falla la red y no está en caché, se puede retornar una página offline genérica
    })
  );
});
// Retira únicamente las versiones anteriores de la caché de este proyecto.
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('tren-maya-cache-') && key !== CACHE_NAME)
      .map(key => caches.delete(key))
  )));
});
