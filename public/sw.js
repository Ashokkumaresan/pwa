importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var STATIC_CACHE_NAME="static-v37";
var DYNAMIC_CACHE_NAME="dynamic-v36";

var dbPromise=idb.open('posts-store',1,function(db){
if(!db.objectStoreNames.contains('posts')){
	db.createObjectStore('posts',{keyPath:'id'});
	}
});
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
});//////////////////////////////////////////////////////////////////////////////////

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
	var url="https://pwademo-563fd.firebaseio.com/posts/first_post.json";
	console.log("[Service worker] fetching something...",e);
	if(e.request.url.indexOf(url)>-1){
		e.respondWith(fetch(e.request)
			.then(function(res){
				var resCloned=res.clone();
				resCloned.json()
				.then(function(data){
					for(key in data){
						write_data('posts',data)
				
					}
				});
				return res;
			})
			)
	}
	//e.respondWith(fetch(e.request));
	else{
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
}
});
self.addEventListener('message', function(event){
    console.log("Service Worker Received Message: " + event.data);
});

self.addEventListener('sync',function(event){
	console.log('[Service worker] background syncing',event);
	if(event.tag==="sync-new-post"){
		console.log("[Service worker] Syncing new posts");
		event.waitUntil(
			read_data('sync-posts')
				.then(function(data){
					for(var dt of data){
					  fetch('https://us-central1-pwademo-563fd.cloudfunctions.net/storePostData',{
					    method:'POST',
					    headers:{
					      'Content-Type':'application/json',
					      'Accept':'application/json'
					    },
					    body:JSON.stringify({
					        id:dt.id,
					        title:dt.title,
					        location:dt.location,
					        image:'https://firebasestorage.googleapis.com/v0/b/pwademo-563fd.appspot.com/o/pwa-reliable.png?alt=media&token=f1c6bb51-4b56-4a6b-9580-0eaec4c7498c'
					    })
  					}).then(function(res){
      				console.log("Data sent",res);
      					if(res.ok){
      						res.json()
      						 .then(function(resData){
      						 	delete_data("sync-posts",resData.id);
      						 });      						
      					}
 					 })
  					.catch(function(err){
  						console.log("Error while sending data", err);
  					});
  				}
				})
			);
	}
});