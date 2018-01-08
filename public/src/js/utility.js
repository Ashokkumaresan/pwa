var dbPromise=idb.open('posts-store',1,function(db){
if(!db.objectStoreNames.contains('posts')){
	db.createObjectStore('posts',{keyPath:'id'});
	}
	if(!db.objectStoreNames.contains('sync-posts')){
	db.createObjectStore('sync-posts',{keyPath:'id'});
	}
});

function write_data(_table,_data){
		return dbPromise.then(function(db){
							var tx = db.transaction(_table,'readwrite');
							var store=tx.objectStore(_table);
							store.put(_data);
							return tx.complete;
						});
}

function read_data(_table){
	return dbPromise.then(function(db){
			var tx=db.transaction(_table,'readwrite');
			var store=tx.objectStore(_table);
			return store.getAll();
	});
}

function delete_data(_table,_data){
	dbPromise.then(function(db){
		var tx=db.transaction(_table,'readwrite');
		var store=tx.objectStore(_table);
		store.delete(_data);
		return tx.complete;
	})
	.then(function(){
		console.log("Item deleted");
	})
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}