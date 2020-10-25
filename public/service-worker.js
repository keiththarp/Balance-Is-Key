const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const iconSizes = ["192", "512"];
const iconFiles = iconSizes.map(
  (size) => `/icons/icon-${size}x${size}.png`
);

const FILES_TO_CACHE = [
  "/",
  "/db.js",
  "/index.html",
  "/index.js",
  "/manifest.webmanifest",
  "/service-worker.js",
  "/styles.css",
  "/favicon.ico",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
].concat(iconFiles);



// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// activate
self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch

self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== "GET") {
    evt.respondWith(fetch(evt.request)
      .then(response => {
        return response;
      }).catch(err => {
        console.log(err);
        return err;
      }));
  } else if (evt.request.url) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {

            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }
});


