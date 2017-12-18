var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var postbutton=document.querySelector('#post-btn');

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
if(window.caches){
  caches.open('App-Cache')
  .then(function(cache){
    cache.add('https://httpbin.org/ip');
    cache.add('https://httpbin.org/uuid');
  });
}
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

postbutton.addEventListener('click',postMessage);