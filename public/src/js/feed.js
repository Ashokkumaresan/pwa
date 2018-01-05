var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var postbutton=document.querySelector('#post-btn');
var _title=document.querySelector('#title');
var _location=document.querySelector('#location');
var videoplayer=document.querySelector('#player');
var canvasholder=document.querySelector('#canvas');
var captureBtn=document.querySelector('#capture-btn');
var filepickerBtn=document.querySelector('#image-picker');
var locationBtn=document.querySelector('#location-btn');
var fileholder=document.querySelector('#pick-image');

function initializeMedia(){
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices = {};
  }
  
}

function openCreatePostModal() {
  console.log("Post Modal");
  createPostArea.style.display = 'block';
  if(deferredPrompt){
  	deferredPrompt.prompt();

  	deferredPrompt.userChoice.then(function(choiceResult){
  		console.log(choiceResult.outcome);
  		if(choiceResult.outcome=="dismissed"){
  			console.log("user cancelled installation");
  		}
  		else{
  			console.log("Added to home screen");
  		}
  	});
  	deferredPrompt=null;
  }
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
      .then(function(reg){
          for(var i=0;i<reg.length;i++)
            reg[i].unregister();
      })
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

function postMessage(){
  sendData();
/*if(window.caches){
  caches.open('App-Cache')
  .then(function(cache){
    cache.add('https://httpbin.org/ip');
    cache.add('https://httpbin.org/uuid');
  });
}*/
/*if('serviceWorker' in navigator && 'SyncManager' in window){
  navigator.serviceWorker.ready
    .then(function(sw){
      var post={
        id:new Date().toISOString(),
        title:_title.value,
        location:_location.value
      }
      write_data('sync-posts',post)
      .then(function(){
        return sw.sync.register('sync-new-post');
      })
      .then(function(){
        console.log("Sync registered");
      });
      
    });
}
else{
  sendData();
} */
}

function sendData(){
  fetch('https://us-central1-pwademo-563fd.cloudfunctions.net/storePostData',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Accept':'application/json'
    },
    body:JSON.stringify({
        id:new Date().toISOString(),
        title:_title.value,
        location:_location.value,
        image:'https://firebasestorage.googleapis.com/v0/b/pwademo-563fd.appspot.com/o/pwa-reliable.png?alt=media&token=f1c6bb51-4b56-4a6b-9580-0eaec4c7498c'
    })
  }).then(function(res){
      console.log("Data sent",res);
  }).catch(function(err){
    console.log("Error",err);
  })

}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

postbutton.addEventListener('click',postMessage);