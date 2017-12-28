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