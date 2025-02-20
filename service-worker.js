// service-worker.js
const CACHE_NAME = 'video-cache-v1';

// Add all your video URLs here - update these paths to match your actual video locations
const VIDEO_URLS = [
  '/start_page.mp4',
  '/room1/Exit_Room.mp4',
  '/room1/Red_Flicker.mp4',
  '/room1/Red_Green_Flicker.mp4',
  '/room1/Zoom_Out.mp4',
  // Add all other video paths here
];

// Install event - cache all videos when service worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pre-caching videos');
        return cache.addAll(VIDEO_URLS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', event => {
  // Only handle video requests
  if (event.request.url.match(/\.(mp4|webm|ogg)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached response if found
          if (response) {
            console.log('Serving video from cache:', event.request.url);
            return response;
          }
          
          // Otherwise fetch from network and cache for next time
          console.log('Fetching video from network:', event.request.url);
          return fetch(event.request).then(networkResponse => {
            // Make sure response is valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Cache the newly fetched video
            let responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return networkResponse;
          });
        })
    );
  }
});