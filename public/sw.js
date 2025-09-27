// Minimal service worker to prevent fetch errors
// This file exists only to stop browser errors when trying to fetch sw.js

self.addEventListener('install', (event) => {
    // Skip waiting to activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Take control of all clients immediately
    event.waitUntil(self.clients.claim());
});

// No caching or fetch handling - just prevents the fetch error
console.log('Service worker loaded to prevent fetch errors');
