var STATIC_CACHE_NAME="static-v9";
var DYNAMIC_CACHE_NAME="dynamic-v8";
self.addEventListener('install',function(e){
	console.log("[Service worker] installing service worker...",e);
	e.waitUntil(
		caches.open(STATIC_CACHE_NAME)
		.then(function(cache){
			console.log("[Service worker] PreCached service started...");
			cache.addAll([
				'/',
				'/index.html',
				'/src/js/material.min.js',
				'/src/js/feed.js',
				'/src/js/app.js',
				'/src/css/app.css',
				'/src/css/feed.css',
				'https://fonts.googleapis.com/css?family=Roboto:400,700',
				'https://fonts.googleapis.com/icon?family=Material+Icons',
				'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
				'/src/images/main-image.jpg'
				]);
		})
		)
});//////////////////////////////
self.addEventListener('activate',function(e){
	console.log("[Service worker] activating service worker...",e);
	e.waitUntil(
		caches.keys()
		.then(function(keyList){
			return Promise.all(keyList.map(function(key){
				if(key!=STATIC_CACHE_NAME && key!=DYNAMIC_CACHE_NAME){
					return caches.delete(key);
				}
			}));
		})
		);
	return self.clients.claim();
});
self.addEventListener('fetch',function(e){
	console.log("[Service worker] fetching something...",e);
	//e.respondWith(fetch(e.request));
	e.respondWith(
		caches.match(e.request)
		.then(function(response){
			if(response)
				return response;
			else 
				return fetch(e.request)
			.then(function(res){
				return caches.open(DYNAMIC_CACHE_NAME)
				.then(function(cache){
					cache.put(e.request.url,res.clone());
					return res;
				})
			});
		})
		)
});
self.addEventListener('message', function(event){
    console.log("Service Worker Received Message: " + event.data);
});