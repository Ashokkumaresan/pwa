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
var loc_loader=document.querySelector('#location-loader');
var picture;

function initializeMedia(){
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices = {};
  }
  if(!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia=function(constraints){
      var getUserMedia=navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if(!getUserMedia){
        return Promise.reject(new Error('getUserMedia not implemented'));
      }
      return new Promise(function(resolve,reject){
        getUserMedia.call(navigator,constraints,resolve,reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({video:true})
    .then(function(stream){
      videoplayer.srcObject=stream;
      videoplayer.style.display='block';
    })
      .catch(function(){
        fileholder.style.display='block';
      })
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
  initializeMedia();
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
      .then(function(reg){
          for(var i=0;i<reg.length;i++)
            reg[i].unregister();
      })
  }
}

function closeCreatePostModal() {
 // createPostArea.style.display = 'none';
   videoplayer.style.display='none';
   fileholder.style.display='none';
  videoplayer.srcObject.getVideoTracks().forEach(function(track){
    track.stop();
  });
}

function captureImage(){
  canvasholder.style.display="block";
  videoplayer.style.display="none";
  captureBtn.style.display="none";
  var context=canvasholder.getContext("2d");
  context.drawImage(videoplayer,0,0,canvasholder.width,videoplayer.videoHeight/(videoplayer.videoHeight/canvasholder.width));
  videoplayer.srcObject.getVideoTracks().forEach(function(track){
    track.stop();
  });
  picture=dataURItoBlob(canvasholder.toDataURL());
}

function getLocation(){
  if('geolocation' in navigator){
    loc_loader.style.display="block";
    var options = {
     enableHighAccuracy: true,
     timeout: 5000,
     maximumAge: 0
};

function success(pos) {
  var crd = pos.coords;
  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);
  _location.value="Latitude: "+ crd.latitude +" Longitude: "+ crd.longitude;
  loc_loader.style.display="none";
};

function error(err) {
  loc_loader.style.display="none";
  console.warn(`ERROR(${err.code}): ${err.message}`);
};
    navigator.geolocation.getCurrentPosition(success,error);   
  }
}

function postMessage(){
  sendData();
  //uploadImage();
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
  var id=new Date().toISOString();
  var postData=new FormData();
  postData.append('id',id);
  postData.append('title',_title.value);
  postData.append('location',_location.value);
  postData.append('file',picture,id +'.png');
  fetch('https://us-central1-pwademo-563fd.cloudfunctions.net/storePostData',{
    method:'POST',
   /* headers:{
      'Content-Type':'application/json',
      'Accept':'application/json'
    },
    body:JSON.stringify({
        id:new Date().toISOString(),
        title:_title.value,
        location:_location.value,
        image:'https://firebasestorage.googleapis.com/v0/b/pwademo-563fd.appspot.com/o/pwa-reliable.png?alt=media&token=f1c6bb51-4b56-4a6b-9580-0eaec4c7498c'
    })*/
  body:postData
  }).then(function(res){
      console.log("Data sent",res);
  }).catch(function(err){
    console.log("Error",err);
  })

}

function uploadImage(){
    var id=new Date().toISOString();
    var postData=new FormData();
     postData.append('file',picture,id +'.png');
       fetch('https://us-central1-pwademo-563fd.cloudfunctions.net/storeImages',{
        method:'POST',  
        body:postData
     }).then(function(res){
      console.log("Data sent",res);
    }).catch(function(err){
      console.log("Error",err);
    })
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

postbutton.addEventListener('click',postMessage);

captureBtn.addEventListener('click',captureImage);

locationBtn.addEventListener('click',getLocation);

filepickerBtn.addEventListener('change',function(event){
  picture=event.target.files[0];
});