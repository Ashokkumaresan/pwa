self.addEventListener('install',function(e){
	console.log("[Service worker] installing service worker...",e);
});
self.addEventListener('activate',function(e){
	console.log("[Service worker] activating service worker...",e);
	return self.clients.claim();
});
self.addEventListener('fetch',function(e){
	console.log("[Service worker] fetching something...",e);
	e.respondWith(fetch(e.request));
});
self.addEventListener('message', function(event){
    console.log("Service Worker Received Message: " + event.data);
});