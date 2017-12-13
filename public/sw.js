self.addEventListener('install',function(e){
	console.log("[Service worker] installing service worker...",e);
	e.waitUntil(
		caches.open('static')
		.then(function(cache){
			console.log("[Service worker] PreCached service started...");
			cache.add('/src/js/app.js');
		})
		)
});
self.addEventListener('activate',function(e){
	console.log("[Service worker] activating service worker...",e);
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
				return fetch(e.request);
		})
		)
});
self.addEventListener('message', function(event){
    console.log("Service Worker Received Message: " + event.data);
});